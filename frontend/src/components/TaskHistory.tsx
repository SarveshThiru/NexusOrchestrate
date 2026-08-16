import React, { useState } from 'react';
import { Task } from '../types';
import {
  HistoryIcon,
  SearchIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  LayersIcon,
  RefreshIcon
} from './icons/Icons';

interface TaskHistoryProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onRerunTask?: (title: string, goal: string, pipelineType: string) => void;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onRerunTask
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'failed'>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon size={14} color="var(--accent-emerald)" />;
      case 'in_progress':
        return <span className="pulse-dot active"></span>;
      case 'failed':
        return <AlertCircleIcon size={14} color="var(--accent-rose)" />;
      default:
        return <ClockIcon size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="history-container">
      {/* Archive Header */}
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <HistoryIcon size={20} color="var(--accent-cyan)" /> Workflow Execution Archive
          </h2>
          <p className="card-subtitle">
            Searchable telemetry logs, synthesized deliverables, and historical orchestration benchmarks.
          </p>
        </div>
        <span className="badge-count">{tasks.length} Executions</span>
      </div>

      {/* Search & Filter Bar */}
      <div className="history-filter-bar">
        <div className="search-input-wrapper">
          <SearchIcon size={15} color="var(--text-muted)" />
          <input
            type="text"
            className="history-search-input"
            placeholder="Search workflows by title, goal, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({tasks.filter((t) => t.status === 'completed').length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            Running ({tasks.filter((t) => t.status === 'in_progress').length})
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === 'failed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('failed')}
          >
            Failed ({tasks.filter((t) => t.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* History List */}
      {filteredTasks.length === 0 ? (
        <div className="history-empty-card">
          <div className="empty-icon-wrap">
            <HistoryIcon size={28} color="var(--text-muted)" />
          </div>
          <div className="empty-text-title">No matching workflows found</div>
          <div className="empty-text-desc">
            {tasks.length === 0
              ? 'Launch your first multi-agent workflow from the Mission Control launchpad.'
              : 'Try adjusting your search query or status filter.'}
          </div>
        </div>
      ) : (
        <div className="history-list">
          {filteredTasks.map((task) => {
            const isSelected = selectedTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`history-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectTask(task)}
              >
                <div className="history-item-top">
                  <div className="history-title-wrap">
                    <span className="history-item-status-icon">{getStatusIcon(task.status)}</span>
                    <h3 className="history-item-title">{task.title}</h3>
                  </div>

                  <div className="history-item-badges">
                    {task.executionTimeMs && (
                      <span className="duration-pill">
                        <ClockIcon size={12} />
                        {(task.executionTimeMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span className={`status-badge-chip ${task.status === 'in_progress' ? 'executing' : task.status}`}>
                      {task.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="history-item-goal">{task.goal}</p>

                <div className="history-item-footer">
                  <div className="footer-left-meta">
                    <span className="task-id-tag">ID: {task.id}</span>
                    <span className="divider-dot">•</span>
                    <span className="task-time-tag">
                      {new Date(task.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="divider-dot">•</span>
                    <span className="task-steps-count">
                      <LayersIcon size={12} />
                      {task.steps ? `${task.steps.length} Phases` : '4 Phases'}
                    </span>
                  </div>

                  {onRerunTask && (
                    <button
                      type="button"
                      className="btn-rerun-task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRerunTask(task.title, task.goal, task.pipelineType);
                      }}
                      title="Re-run this workflow objective"
                    >
                      <RefreshIcon size={12} />
                      <span>Re-Run</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
