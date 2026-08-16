const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  name: { type: String, required: true },
  agentId: { type: String, required: true },
  agentName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
  output: { type: String, default: '' },
  thought: { type: String, default: '' },
  startedAt: { type: Date },
  completedAt: { type: Date }
});

const LogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  agentId: { type: String, required: true },
  agentName: { type: String, required: true },
  agentAvatar: { type: String, default: '🤖' },
  agentColor: { type: String, default: '#6366f1' },
  type: { type: String, enum: ['thought', 'action', 'output', 'system', 'deliverable'], default: 'thought' },
  content: { type: String, required: true }
});

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  goal: { type: String, required: true },
  pipelineType: { type: String, enum: ['full_collaboration', 'quick_plan', 'code_review', 'research_only'], default: 'full_collaboration' },
  status: { type: String, enum: ['queued', 'in_progress', 'completed', 'failed'], default: 'queued' },
  assignedAgents: [{ type: String }],
  steps: [StepSchema],
  logs: [LogSchema],
  deliverable: { type: String, default: '' },
  executionTimeMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Task', TaskSchema);
