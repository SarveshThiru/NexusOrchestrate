import React, { useState, useEffect } from 'react';
import {
  RocketIcon,
  SparklesIcon,
  ZapIcon,
  LayersIcon
} from './icons/Icons';

interface TaskLaunchpadProps {
  onLaunchTask: (title: string, goal: string, pipelineType: string) => Promise<void>;
  isLaunching: boolean;
}

interface Preset {
  title: string;
  goal: string;
  pipeline: 'full_collaboration' | 'quick_plan' | 'code_review';
  category: string;
  tag: string;
}

const PRESETS: Preset[] = [
  {
    title: 'High-Throughput Event Ingestion Engine',
    goal: 'Architect a distributed, resilient event stream ingestion pipeline using Kafka, Redis in-memory ring buffer, and Node.js microservices with backpressure handling.',
    pipeline: 'full_collaboration',
    category: 'Distributed Systems',
    tag: 'High Concurrency'
  },
  {
    title: 'Zero-Trust Authentication & RBAC Service',
    goal: 'Build an enterprise-grade Zero-Trust authentication microservice with RS256 JWT rotation, Redis session revocation lists, and rate-limiting middleware.',
    pipeline: 'full_collaboration',
    category: 'Cybersecurity',
    tag: 'Security & Auth'
  },
  {
    title: 'Two-Tier Distributed Cache & Write-Behind Layer',
    goal: 'Design a high-speed two-tier caching strategy combining local memory (LRU) with Redis distributed clusters and asynchronous write-behind persistence to MongoDB.',
    pipeline: 'full_collaboration',
    category: 'Data Storage',
    tag: 'Performance'
  },
  {
    title: 'Cloud-Native Kubernetes Auto-Healing Ingress',
    goal: 'Formulate an automated canary deployment and self-healing ingress controller architecture for multi-region containerized services.',
    pipeline: 'quick_plan',
    category: 'DevOps & Cloud',
    tag: 'Infrastructure'
  },
  {
    title: 'Cryptographic Token Validator & Audit Suite',
    goal: 'Perform static code analysis, timing-attack vulnerability mitigation, and unit test generation for a secure cryptographic payment signature validator.',
    pipeline: 'code_review',
    category: 'Quality Assurance',
    tag: 'Audit & QA'
  }
];

const TaskLaunchpad: React.FC<TaskLaunchpadProps> = ({ onLaunchTask, isLaunching }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [pipelineType, setPipelineType] = useState<'full_collaboration' | 'quick_plan' | 'code_review'>('full_collaboration');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Distributed Systems', 'Cybersecurity', 'Data Storage', 'DevOps & Cloud', 'Quality Assurance'];

  const filteredPresets = selectedCategory === 'All'
    ? PRESETS
    : PRESETS.filter((p) => p.category === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLaunching) return;
    await onLaunchTask(title.trim() || goal.slice(0, 45), goal.trim(), pipelineType);
    setTitle('');
    setGoal('');
  };

  const handleSelectPreset = (preset: Preset) => {
    setTitle(preset.title);
    setGoal(preset.goal);
    setPipelineType(preset.pipeline);
  };

  // Keyboard shortcut: Ctrl + Enter to dispatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (goal.trim() && !isLaunching) {
          onLaunchTask(title.trim() || goal.slice(0, 45), goal.trim(), pipelineType);
          setTitle('');
          setGoal('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goal, title, pipelineType, isLaunching, onLaunchTask]);

  return (
    <div className="launchpad-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <RocketIcon size={20} color="var(--accent-indigo)" /> Task Launchpad
          </h2>
          <p className="card-subtitle">
            Configure objectives and dispatch autonomous multi-agent pipelines with live telemetry.
          </p>
        </div>
        <span className="badge-mode">AUTONOMOUS</span>
      </div>

      {/* Preset Category Filters & Pills */}
      <div className="presets-section">
        <div className="section-label-row">
          <label className="form-label">
            <SparklesIcon size={14} color="var(--accent-cyan)" /> Workflow Blueprints:
          </label>
          <div className="category-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="preset-grid">
          {filteredPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-card-btn"
              onClick={() => handleSelectPreset(p)}
            >
              <div className="preset-header">
                <span className="preset-tag">{p.tag}</span>
                <span className="preset-pipeline-tag">
                  {p.pipeline === 'full_collaboration' ? '4-Phase Hive' : p.pipeline === 'quick_plan' ? 'Architect Only' : 'QA & Code'}
                </span>
              </div>
              <div className="preset-title">{p.title}</div>
              <div className="preset-desc">{p.goal}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Launch Configuration Form */}
      <form onSubmit={handleSubmit} className="launchpad-form">
        <div className="form-group">
          <div className="label-with-hint">
            <label htmlFor="workflow-title" className="form-label">Workflow Identifier / Title (Optional)</label>
            <span className="input-hint">Will auto-generate if blank</span>
          </div>
          <input
            id="workflow-title"
            type="text"
            className="form-input"
            placeholder="e.g. Real-Time Distributed Consensus Engine"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="label-with-hint">
            <label htmlFor="workflow-goal" className="form-label">Objective & Architectural Goal *</label>
            <span className="char-count">{goal.length} chars</span>
          </div>
          <textarea
            id="workflow-goal"
            className="form-textarea"
            placeholder="Specify what the autonomous hive should architect, research, implement, and audit..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <LayersIcon size={14} color="var(--accent-indigo)" /> Autonomous Pipeline Sequence
          </label>
          <div className="pipeline-selector-grid">
            <div
              className={`pipeline-option ${pipelineType === 'full_collaboration' ? 'selected' : ''}`}
              onClick={() => setPipelineType('full_collaboration')}
            >
              <div className="pipeline-radio-indicator">
                <div className="radio-inner" />
              </div>
              <div className="pipeline-option-content">
                <div className="pipeline-name">Full 4-Agent Autonomous Pipeline</div>
                <div className="pipeline-path">Atlas (Arch) ➔ Nova (Research) ➔ Cypher (Code) ➔ Aegis (Audit)</div>
              </div>
            </div>

            <div
              className={`pipeline-option ${pipelineType === 'quick_plan' ? 'selected' : ''}`}
              onClick={() => setPipelineType('quick_plan')}
            >
              <div className="pipeline-radio-indicator">
                <div className="radio-inner" />
              </div>
              <div className="pipeline-option-content">
                <div className="pipeline-name">Rapid Architecture & Research Pipeline</div>
                <div className="pipeline-path">Atlas (System Architect) ➔ Nova (Research Analyst)</div>
              </div>
            </div>

            <div
              className={`pipeline-option ${pipelineType === 'code_review' ? 'selected' : ''}`}
              onClick={() => setPipelineType('code_review')}
            >
              <div className="pipeline-radio-indicator">
                <div className="radio-inner" />
              </div>
              <div className="pipeline-option-content">
                <div className="pipeline-name">Implementation & Security Audit Pipeline</div>
                <div className="pipeline-path">Cypher (Lead Coder) ➔ Aegis (Security & QA Reviewer)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Dispatch Control */}
        <div className="form-submit-row">
          <div className="shortcut-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to launch
          </div>

          <button
            type="submit"
            className="btn-launch-primary"
            disabled={isLaunching || !goal.trim()}
          >
            {isLaunching ? (
              <>
                <span className="spinner-icon"></span>
                <span>Dispatching Cognitive Fleet...</span>
              </>
            ) : (
              <>
                <ZapIcon size={18} color="#ffffff" />
                <span>Dispatch Autonomous Workflow</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskLaunchpad;
