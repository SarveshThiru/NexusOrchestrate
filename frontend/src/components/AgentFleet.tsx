import React, { useState } from 'react';
import { Agent } from '../types';
import {
  UsersIcon,
  CpuIcon,
  ShieldIcon,
  TerminalIcon,
  SparklesIcon,
  PlusIcon,
  XIcon,
  CopyIcon,
  CheckIcon,
  InfoIcon
} from './icons/Icons';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || '';

interface AgentFleetProps {
  agents: Agent[];
  onAgentCreated?: () => void;
}

const AgentFleet: React.FC<AgentFleetProps> = ({ agents, onAgentCreated }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // New Agent Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [model, setModel] = useState('gemini-2.5-pro-preview');
  const [capabilitiesStr, setCapabilitiesStr] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const capabilities = capabilitiesStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          description: description.trim() || `Specialized agent for ${role}`,
          color,
          avatar: '🤖',
          capabilities: capabilities.length ? capabilities : ['Autonomous Task Execution'],
          systemPrompt: systemPrompt.trim() || `You are ${name}, a specialist in ${role}.`
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setName('');
        setRole('');
        setDescription('');
        setCapabilitiesStr('');
        setSystemPrompt('');
        if (onAgentCreated) onAgentCreated();
      }
    } catch (err) {
      console.error('Failed to create agent:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getAgentRoleIcon = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r.includes('architect') || r.includes('lead')) return <CpuIcon size={20} color="var(--accent-indigo)" />;
    if (r.includes('research') || r.includes('data')) return <SparklesIcon size={20} color="var(--accent-cyan)" />;
    if (r.includes('code') || r.includes('developer') || r.includes('synthesizer')) return <TerminalIcon size={20} color="var(--accent-amber)" />;
    if (r.includes('security') || r.includes('review') || r.includes('audit')) return <ShieldIcon size={20} color="var(--accent-emerald)" />;
    return <UsersIcon size={20} color="var(--text-secondary)" />;
  };

  return (
    <div className="fleet-container">
      {/* Fleet Header */}
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <UsersIcon size={20} color="var(--accent-indigo)" /> Autonomous Cognitive Fleet Matrix
          </h2>
          <p className="card-subtitle">
            Specialized neural entities orchestrated across pipeline phases for architecture, research, code synthesis, and security validation.
          </p>
        </div>

        <button
          className="btn-create-agent"
          onClick={() => setShowCreateModal(true)}
          title="Deploy a new custom cognitive agent"
        >
          <PlusIcon size={16} />
          <span>Deploy Custom Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="agent-grid">
        {agents.map((agent) => (
          <div key={agent.id} className="agent-card">
            <div className="agent-card-header">
              <div className="agent-identity">
                <div
                  className="agent-avatar-box"
                  style={{ borderColor: `${agent.color}40`, backgroundColor: `${agent.color}15` }}
                >
                  {getAgentRoleIcon(agent.role)}
                </div>
                <div>
                  <h3 className="agent-name" style={{ color: agent.color }}>
                    {agent.name}
                  </h3>
                  <p className="agent-role">{agent.role}</p>
                </div>
              </div>

              <span className={`status-badge-chip ${agent.status}`}>
                <span className={`pulse-dot ${agent.status}`}></span>
                {agent.status.toUpperCase()}
              </span>
            </div>

            <p className="agent-desc">{agent.description}</p>

            <div className="agent-capabilities-section">
              <span className="capabilities-label">CAPABILITIES & SPECIALIZATIONS:</span>
              <div className="agent-tags">
                {agent.capabilities.map((cap, idx) => (
                  <span key={idx} className="agent-tag-chip">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div className="agent-footer-meta">
              <div className="engine-tag">
                <span className="meta-label">ENGINE:</span>
                <span className="meta-val">{agent.model || 'gemini-2.5-pro'}</span>
              </div>
              <button
                className="btn-inspect-prompt"
                onClick={() => setSelectedAgent(agent)}
                title="Inspect system prompt"
              >
                <InfoIcon size={14} />
                <span>Inspect Prompt</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent System Prompt Inspection Modal */}
      {selectedAgent && (
        <div className="modal-backdrop" onClick={() => setSelectedAgent(null)}>
          <div className="modal-dialog prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div
                  className="modal-agent-avatar"
                  style={{ borderColor: selectedAgent.color, backgroundColor: `${selectedAgent.color}20` }}
                >
                  {getAgentRoleIcon(selectedAgent.role)}
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: selectedAgent.color }}>
                    {selectedAgent.name} &bull; Cognitive Persona &amp; System Prompt
                  </h3>
                  <p className="modal-subtitle">{selectedAgent.role} • Engine: {selectedAgent.model || 'gemini-2.5-pro'}</p>
                </div>
              </div>

              <button
                className="btn-modal-close"
                onClick={() => setSelectedAgent(null)}
                aria-label="Close modal"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="prompt-header-row">
                <span className="section-title-label">SYSTEM PROMPT INSTRUCTION SPECIFICATION:</span>
                <button
                  className="btn-copy-small"
                  onClick={() => handleCopyPrompt(selectedAgent.systemPrompt || '')}
                >
                  {copiedPrompt ? <CheckIcon size={14} color="var(--accent-emerald)" /> : <CopyIcon size={14} />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>

              <pre className="prompt-text-box">
                {selectedAgent.systemPrompt || 'No system prompt defined for this agent.'}
              </pre>

              <div className="modal-meta-grid">
                <div className="modal-meta-item">
                  <span className="meta-key">AGENT ID:</span>
                  <span className="meta-val">{selectedAgent.id}</span>
                </div>
                <div className="modal-meta-item">
                  <span className="meta-key">STATUS:</span>
                  <span className="meta-val" style={{ textTransform: 'uppercase' }}>{selectedAgent.status}</span>
                </div>
                <div className="modal-meta-item">
                  <span className="meta-key">SECURITY ISOLATION:</span>
                  <span className="meta-val">Sandboxed Cognitive Worker</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Agent Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <PlusIcon size={20} color="var(--accent-cyan)" />
                <div>
                  <h3 className="modal-title">Deploy Custom Cognitive Agent</h3>
                  <p className="modal-subtitle">Provision an autonomous neural agent into the NexusOrchestrate fleet</p>
                </div>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Agent Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Chronos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialist Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Real-Time Telemetry Specialist"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <input
                    type="color"
                    className="form-color-picker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LLM Engine</label>
                  <select
                    className="form-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="gemini-2.5-pro-preview">Gemini 2.5 Pro (High Reasoning)</option>
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
                    <option value="gpt-4o">GPT-4o Omnimodal</option>
                    <option value="deepseek-r1">DeepSeek R1 (Math & Code)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Primary responsibility and orchestration scope"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capabilities (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Distributed Caching, Latency Tuning, Failover Routing"
                  value={capabilitiesStr}
                  onChange={(e) => setCapabilitiesStr(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Prompt & Persona Instructions</label>
                <textarea
                  className="form-textarea"
                  placeholder="Define the agent's cognitive persona, constraints, output rules..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-launch-primary"
                  disabled={isSubmitting || !name.trim() || !role.trim()}
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy Agent to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentFleet;
