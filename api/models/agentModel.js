const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, required: true },
  avatar: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  model: { type: String, default: 'gpt-4o' },
  status: { type: String, enum: ['idle', 'thinking', 'executing', 'offline'], default: 'idle' },
  capabilities: [{ type: String }],
  systemPrompt: { type: String, required: true },
  tasksCompleted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', AgentSchema);
