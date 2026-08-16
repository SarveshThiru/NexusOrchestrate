const redis = require('redis');
const EventEmitter = require('events');

const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(100);

let client = null;
let subscriber = null;

async function initRedis(url) {
  if (client) return { client, subscriber, emitter: localEmitter };

  client = redis.createClient({ url });
  client.on('error', (err) => console.error('Redis Client Error:', err));
  await client.connect();
  console.log('Redis publisher client connected');

  try {
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
    console.warn('Redis pubsub init warning (falling back to local emitter):', err.message);
  }

  return { client, subscriber, emitter: localEmitter };
}

async function publishEvent(taskId, eventData) {
  const payload = {
    taskId,
    ...eventData,
    timestamp: new Date().toISOString()
  };

  // Local fallback / immediate dispatch
  localEmitter.emit(`task:${taskId}`, payload);
  localEmitter.emit('all_events', payload);

  // Redis broadcast
  if (client && client.isOpen) {
    try {
      await client.publish('agent:events', JSON.stringify(payload));
    } catch (err) {
      console.error('Error publishing event to Redis:', err);
    }
  }
}

async function setCache(key, value, expirySeconds = 300) {
  if (!client || !client.isOpen) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: expirySeconds });
  } catch (err) {
    console.error('Redis setCache error:', err);
  }
}

async function getCache(key) {
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
