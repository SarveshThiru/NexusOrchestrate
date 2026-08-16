const redis = require('redis');
const EventEmitter = require('events');

const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(100);

let client = null;
let subscriber = null;

// Upstash REST helper for serverless Vercel deployments
async function upstashCommand(commandArray) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commandArray)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('Upstash REST command error:', err);
    return null;
  }
}

async function initRedis(url) {
  // If Upstash REST credentials exist, we are ready for serverless
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('Upstash Redis REST client configured for serverless');
    return { client: null, subscriber: null, emitter: localEmitter };
  }

  if (client) return { client, subscriber, emitter: localEmitter };

  if (!url || url.includes('undefined')) return { client: null, subscriber: null, emitter: localEmitter };

  try {
    client = redis.createClient({ url });
    client.on('error', (err) => console.error('Redis Client Error:', err));
    await client.connect();
    console.log('Redis publisher client connected');

    subscriber = client.duplicate();
    subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
    await subscriber.connect();
    
    await subscriber.subscribe('agent:events', (message) => {
      try {
        const parsed = JSON.parse(message);
        localEmitter.emit(`task:${parsed.taskId}`, parsed);
        localEmitter.emit('all_events', parsed);
      } catch (e) {
        console.error('Failed to parse redis event:', e);
      }
    });
    console.log('Redis subscriber connected and listening');
  } catch (err) {
    console.warn('Redis TCP init warning (using in-memory emitter fallback):', err.message);
  }

  return { client, subscriber, emitter: localEmitter };
}

async function publishEvent(taskId, eventData) {
  const payload = {
    taskId,
    ...eventData,
    timestamp: new Date().toISOString()
  };

  // Local fallback / immediate dispatch (crucial for SSE stream)
  localEmitter.emit(`task:${taskId}`, payload);
  localEmitter.emit('all_events', payload);

  // Upstash REST publish (if configured)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      await upstashCommand(['PUBLISH', 'agent:events', JSON.stringify(payload)]);
    } catch (err) {
      console.error('Upstash publish error:', err);
    }
  }

  // Standard Redis TCP broadcast
  if (client && client.isOpen) {
    try {
      await client.publish('agent:events', JSON.stringify(payload));
    } catch (err) {
      console.error('Error publishing event to Redis:', err);
    }
  }
}

async function setCache(key, value, expirySeconds = 300) {
  const valString = JSON.stringify(value);

  // Upstash REST
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    await upstashCommand(['SET', key, valString, 'EX', String(expirySeconds)]);
    return;
  }

  // Standard Redis
  if (!client || !client.isOpen) return;
  try {
    await client.set(key, valString, { EX: expirySeconds });
  } catch (err) {
    console.error('Redis setCache error:', err);
  }
}

async function getCache(key) {
  // Upstash REST
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const data = await upstashCommand(['GET', key]);
    if (!data) return null;
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  }

  // Standard Redis
  if (!client || !client.isOpen) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis getCache error:', err);
    return null;
  }
}

async function deleteCache(key) {
  // Upstash REST
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    await upstashCommand(['DEL', key]);
    return;
  }

  // Standard Redis
  if (!client || !client.isOpen) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error('Redis deleteCache error:', err);
  }
}

function getEmitter() {
  return localEmitter;
}

module.exports = {
  initRedis,
  publishEvent,
  setCache,
  getCache,
  deleteCache,
  getEmitter
};
