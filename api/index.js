require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Agent = require('./models/agentModel');
const Task = require('./models/taskModel');
const { initRedis, getCache, setCache, getEmitter } = require('./services/redisService');
const { seedDefaultAgents, runTaskExecution, DEFAULT_AGENTS } = require('./services/multiAgentEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connect to MongoDB & Redis
let isInitialized = false;
async function initializeServices() {
  if (isInitialized && mongoose.connection.readyState === 1) return;
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/multiagent';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully');
    }

    // Seed default agents
    await seedDefaultAgents();

    // Initialize Redis
    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
    await initRedis(redisUrl);
    isInitialized = true;
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

initializeServices();

// Serverless connection middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await initializeServices();
  }
  next();
});

// ================= ROUTES ================= //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'multi-agent-api',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// System Stats
app.get('/api/stats', async (req, res) => {
  try {
    const cachedStats = await getCache('system:stats');
    if (cachedStats) {
      return res.json({ fromCache: true, ...cachedStats });
    }

    const [agentCount, taskCount, activeTaskCount] = await Promise.all([
      Agent.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: { $in: ['in_progress', 'queued'] } })
    ]);

    const stats = {
      agentsTotal: agentCount || DEFAULT_AGENTS.length,
      tasksTotal: taskCount,
      activeTasks: activeTaskCount,
      mongoStatus: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded',
      redisStatus: 'healthy',
      fleetStatus: 'operational',
      timestamp: new Date().toISOString()
    };

    await setCache('system:stats', stats, 10);
    res.json({ fromCache: false, ...stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Agents
app.get('/api/agents', async (req, res) => {
  try {
    const cached = await getCache('fleet:agents');
    if (cached) return res.json(cached);

    let agents = await Agent.find().sort({ createdAt: 1 });
    if (!agents.length) agents = DEFAULT_AGENTS;

    await setCache('fleet:agents', agents, 30);
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Custom Agent
app.post('/api/agents', async (req, res) => {
  try {
    const { name, role, description, avatar, color, capabilities, systemPrompt } = req.body;
    const newAgent = new Agent({
      id: `agent-${Date.now()}`,
      name,
      role,
      description,
      avatar: avatar || '🤖',
      color: color || '#6366f1',
      capabilities: capabilities || ['Custom Task Execution'],
      systemPrompt: systemPrompt || `You are ${name}, specializing in ${role}.`
    });

    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(20);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Specific Task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const cached = await getCache(`task:${req.params.id}`);
    if (cached) return res.json(cached);

    const task = await Task.findOne({ id: req.params.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Launch New Multi-Agent Workflow
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, goal, pipelineType } = req.body;
    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const taskId = `task-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const taskTitle = title || goal.slice(0, 45) + (goal.length > 45 ? '...' : '');

    const initialSteps = [
      { stepNumber: 1, name: 'System Architecture & Task Decomposition', agentId: 'agent-architect', agentName: 'Atlas', status: 'pending' },
      { stepNumber: 2, name: 'Deep Technical Research & Pattern Discovery', agentId: 'agent-researcher', agentName: 'Nova', status: 'pending' },
      { stepNumber: 3, name: 'Implementation & Artifact Generation', agentId: 'agent-coder', agentName: 'Cypher', status: 'pending' },
      { stepNumber: 4, name: 'Security Audit & Quality Certification', agentId: 'agent-reviewer', agentName: 'Aegis', status: 'pending' }
    ];

    const newTask = new Task({
      id: taskId,
      title: taskTitle,
      goal,
      pipelineType: pipelineType || 'full_collaboration',
      status: 'queued',
      assignedAgents: ['agent-architect', 'agent-researcher', 'agent-coder', 'agent-reviewer'],
      steps: initialSteps,
      logs: []
    });

    await newTask.save();

    // On Vercel / serverless runtime, we must await execution before returning HTTP response,
    // otherwise the serverless runtime freezes execution and background promises are killed!
    if (process.env.VERCEL || process.env.SERVERLESS) {
      await runTaskExecution(taskId, { serverless: true });
      const completedTask = await Task.findOne({ id: taskId });
      return res.status(201).json(completedTask || newTask);
    }

    // In long-running container mode (Docker / local dev)
    runTaskExecution(taskId);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server-Sent Events (SSE) stream for live agent execution
app.get('/api/tasks/:id/stream', async (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  // Replay existing logs and step states if task already has progress
  try {
    const existingTask = await Task.findOne({ id });
    if (existingTask) {
      res.write(`data: ${JSON.stringify({ type: 'sync', task: existingTask })}\n\n`);
    }
  } catch (err) {
    console.error('Error fetching task state for SSE:', err);
  }

  res.write(`data: ${JSON.stringify({ type: 'connected', taskId: id })}\n\n`);

  const emitter = getEmitter();

  const handleTaskEvent = (eventData) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    if (eventData.type === 'completed' || eventData.type === 'failed') {
      res.end();
    }
  };

  emitter.on(`task:${id}`, handleTaskEvent);

  req.on('close', () => {
    emitter.off(`task:${id}`, handleTaskEvent);
  });
});

// Demo data endpoints
app.get('/api/data', async (req, res) => {
  try {
    const cacheKey = 'latest-data';
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({ fromCache: true, data: cached });
    }

    const data = {
      id: Date.now(),
      message: 'Hello from Multi-Agent API',
      timestamp: new Date().toISOString()
    };

    await setCache(cacheKey, data, 300);
    res.json({ fromCache: false, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const data = req.body;
    await setCache('latest-data', data, 300);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Multi-Agent API server running on port ${PORT}`);
  });
}

module.exports = app;