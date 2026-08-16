import React, { useEffect, useRef, useState } from 'react';
import { Task } from '../types';
import {
  TerminalIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CopyIcon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  SparklesIcon,
  SearchIcon,
  ZapIcon,
  CheckIcon
} from './icons/Icons';

interface LiveWorkflowViewerProps {
  task: Task | null;
}

const LiveWorkflowViewer: React.FC<LiveWorkflowViewerProps> = ({ task }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedDeliverable, setCopiedDeliverable] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.logs, autoScroll]);

  if (!task) {
    return (
      <div className="workflow-card empty-state">
        <div className="empty-state-content">
          <div className="radar-scanner-wrapper">
            <div className="radar-circle c1"></div>
            <div className="radar-circle c2"></div>
            <div className="radar-sweep"></div>
            <TerminalIcon size={32} color="var(--accent-indigo)" />
          </div>
          <h3 className="empty-title">Awaiting Workflow Telemetry</h3>
          <p className="empty-desc">
            Dispatch a workflow from the launchpad or select an archived execution to view real-time multi-agent reasoning, phase transitions, and deliverables.
          </p>
        </div>
      </div>
    );
  }

  // Filter logs based on agent, type, and search query
  const filteredLogs = (task.logs || []).filter((log) => {
    const matchesAgent = selectedAgentFilter === 'all' || log.agentId === selectedAgentFilter || log.agentName?.toLowerCase() === selectedAgentFilter.toLowerCase();
    const matchesType = selectedTypeFilter === 'all' || log.type === selectedTypeFilter;
    const matchesSearch = !searchQuery.trim() ||
      log.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agentName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesType && matchesSearch;
  });

  const handleCopyDeliverable = () => {
    if (task.deliverable) {
      navigator.clipboard.writeText(task.deliverable);
      setCopiedDeliverable(true);
      setTimeout(() => setCopiedDeliverable(false), 2000);
    }
  };

  const handleDownloadDeliverable = () => {
    if (!task.deliverable) return;
    const element = document.createElement('a');
    const file = new Blob([task.deliverable], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${task.id}-deliverable.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyAllLogs = () => {
    const text = (task.logs || [])
      .map((l) => `[${l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'LOG'}] [${l.agentName || 'SYSTEM'}] (${l.type}): ${l.content}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="step-icon completed" title="Phase Completed">
            <CheckCircleIcon size={16} color="var(--accent-emerald)" />
          </span>
        );
      case 'in_progress':
        return (
          <span className="step-icon in_progress" title="Phase In Progress">
            <span className="node-pulse-indicator"></span>
          </span>
        );
      case 'failed':
        return (
          <span className="step-icon failed" title="Phase Failed">
            <AlertCircleIcon size={16} color="var(--accent-rose)" />
          </span>
        );
      default:
        return (
          <span className="step-icon pending" title="Phase Pending">
            <ClockIcon size={14} color="var(--text-muted)" />
          </span>
        );
    }
  };

  return (
    <div className={`workflow-card ${isFullscreen ? 'fullscreen-overlay' : ''}`}>
      {/* Workflow Header */}
      <div className="card-header workflow-header">
        <div className="header-meta">
          <div className="title-row">
            <h2 className="card-title">
              <ZapIcon size={20} color="var(--accent-cyan)" /> {task.title}
            </h2>
            <span className={`status-badge-hero ${task.status === 'in_progress' ? 'executing' : task.status}`}>
              {task.status === 'in_progress' ? 'EXECUTING PIPELINE' : task.status.toUpperCase()}
            </span>
          </div>
          <p className="task-goal-text">
            <span className="goal-tag">OBJECTIVE:</span> {task.goal}
          </p>
        </div>

        <div className="workflow-controls">
          {task.executionTimeMs && (
            <div className="time-metric">
              <ClockIcon size={14} color="var(--text-muted)" />
              <span>{(task.executionTimeMs / 1000).toFixed(2)}s</span>
            </div>
          )}
          <button
            className="btn-icon-hud"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
        </div>
      </div>

      {/* 4-Phase Pipeline Graph Topology */}
      <div className="pipeline-topology-container">
        <div className="topology-title-bar">
          <span className="topology-label">AUTONOMOUS PIPELINE TOPOLOGY</span>
          <span className="topology-hint">Click agent node to filter telemetry</span>
        </div>

        <div className="pipeline-nodes-grid">
          {task.steps.map((step, idx) => {
            const isFilterActive = selectedAgentFilter === step.agentId || selectedAgentFilter === step.agentName;
            return (
              <div
                key={step.stepNumber}
                className={`pipeline-node-card ${step.status} ${isFilterActive ? 'filtered-active' : ''}`}
                onClick={() => setSelectedAgentFilter(isFilterActive ? 'all' : step.agentName)}
                title={`Filter logs for @${step.agentName}`}
              >
                <div className="node-header">
                  <div className="node-phase">PHASE 0{step.stepNumber}</div>
                  {getStepStatusBadge(step.status)}
                </div>

                <div className="node-body">
                  <div className="node-agent-name">@{step.agentName}</div>
                  <div className="node-step-name">{step.name}</div>
                </div>

                <div className="node-footer">
                  <span className={`node-status-text ${step.status}`}>
                    {step.status === 'in_progress' ? 'Thinking...' : step.status.toUpperCase()}
                  </span>
                </div>

                {/* Animated connector line between phases */}
                {idx < task.steps.length - 1 && (
                  <div className={`node-connector ${step.status === 'completed' ? 'active' : ''}`}>
                    <span className="connector-packet"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal HUD & Live Log Stream */}
      <div className="terminal-hud">
        {/* Terminal Header with Filters & Search */}
        <div className="terminal-hud-header">
          <div className="terminal-left-meta">
            <div className="terminal-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="terminal-title">live-telemetry // {task.id}</span>
            <span className="log-count-tag">{filteredLogs.length} events</span>
          </div>

          <div className="terminal-hud-actions">
            {/* Search Input */}
            <div className="terminal-search-wrapper">
              <SearchIcon size={13} color="var(--text-muted)" />
              <input
                type="text"
                className="terminal-search-input"
                placeholder="Filter stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Event Type Filter */}
            <select
              className="terminal-select"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              aria-label="Filter by log type"
            >
              <option value="all">All Event Types</option>
              <option value="thought">Thoughts</option>
              <option value="action">Actions</option>
              <option value="output">Outputs</option>
              <option value="deliverable">Deliverables</option>
              <option value="system">System</option>
            </select>

            {/* Auto-Scroll Toggle */}
            <button
              className={`btn-hud-toggle ${autoScroll ? 'active' : ''}`}
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'Auto-scroll ENABLED' : 'Auto-scroll PAUSED'}
            >
              <ClockIcon size={13} />
              <span>{autoScroll ? 'Live Follow' : 'Scroll Free'}</span>
            </button>

            {/* Copy Logs */}
            <button
              className="btn-hud-tool"
              onClick={handleCopyAllLogs}
              title="Copy full telemetry log stream"
            >
              {copiedLogs ? <CheckIcon size={14} color="var(--accent-emerald)" /> : <CopyIcon size={14} />}
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="terminal-hud-body">
          {filteredLogs.length === 0 ? (
            <div className="terminal-empty-stream">
              <span className="terminal-cursor">_</span>
              {task.logs.length === 0
                ? 'Initializing multi-agent session. Establishing real-time event pipeline...'
                : 'No telemetry events match the current filter criteria.'}
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id || idx} className={`telemetry-log-row ${log.type}`}>
                <div className="log-timestamp">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                </div>

                <div
                  className="log-agent-pill"
                  style={{
                    color: log.agentColor || 'var(--accent-indigo)',
                    borderColor: `${log.agentColor || 'var(--accent-indigo)'}40`,
                    backgroundColor: `${log.agentColor || 'var(--accent-indigo)'}15`
                  }}
                >
                  <span className="agent-tag-role">@{log.agentName || 'SYSTEM'}</span>
                </div>

                <div className={`log-type-tag ${log.type}`}>
                  {log.type}
                </div>

                <div className="log-text-payload">
                  {log.content}
                </div>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Deliverable & Architecture Specification Box */}
      {task.deliverable && (
        <div className="deliverable-container">
          <div className="deliverable-header-bar">
            <div className="deliverable-title">
              <SparklesIcon size={18} color="var(--accent-emerald)" />
              <span>Final Synthesized Architecture & Specification</span>
            </div>

            <div className="deliverable-actions">
              <button
                className="btn-action-deliverable"
                onClick={handleCopyDeliverable}
                title="Copy specification markdown"
              >
                {copiedDeliverable ? (
                  <>
                    <CheckIcon size={14} color="var(--accent-emerald)" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>

              <button
                className="btn-action-deliverable"
                onClick={handleDownloadDeliverable}
                title="Download specification file"
              >
                <DownloadIcon size={14} />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          <pre className="deliverable-markdown-box">{task.deliverable}</pre>
        </div>
      )}
    </div>
  );
};

export default LiveWorkflowViewer;
