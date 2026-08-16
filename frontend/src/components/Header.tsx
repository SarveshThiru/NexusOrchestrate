import React from 'react';
import {
  BotIcon,
  RocketIcon,
  UsersIcon,
  HistoryIcon,
  BarChartIcon,
  VolumeIcon,
  VolumeXIcon,
  PlusIcon
} from './icons/Icons';
import { SystemStats } from '../types';

interface HeaderProps {
  activeTab: 'launchpad' | 'fleet' | 'history' | 'analytics';
  setActiveTab: (tab: 'launchpad' | 'fleet' | 'history' | 'analytics') => void;
  activeTaskCount: number;
  stats: SystemStats | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onQuickNewTask: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeTaskCount,
  stats,
  soundEnabled,
  onToggleSound,
  onQuickNewTask
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-wrapper">
          <div className="brand-logo">
            <BotIcon size={26} color="#ffffff" strokeWidth={2.2} />
            <span className="brand-glow-ring"></span>
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">NexusOrchestrate</h1>
              <span className="version-tag">Multi-Agent AI</span>
            </div>
            <p className="brand-subtitle">Autonomous Cognitive Fleet Orchestration &amp; Real-Time Mission Control</p>
          </div>
        </div>

        {/* Global Cluster Status Indicators */}
        <div className="cluster-status-pill">
          <div className="status-indicator">
            <span className="pulse-indicator online"></span>
            <span className="status-text">FLEET ONLINE</span>
          </div>
          <span className="divider-vert"></span>
          <div className="status-telemetry">
            <span className="telemetry-item">
              <span className="dot-mini green"></span> MONGO:{' '}
              {stats?.mongoStatus === 'healthy' ? 'OK' : 'ACTIVE'}
            </span>
            <span className="telemetry-item">
              <span className="dot-mini amber"></span> REDIS:{' '}
              {stats?.redisStatus === 'healthy' ? 'OK' : 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`tab-btn ${activeTab === 'launchpad' ? 'active' : ''}`}
            onClick={() => setActiveTab('launchpad')}
            title="Launch and monitor multi-agent workflows in real time"
          >
            <RocketIcon size={16} />
            <span>Mission Control</span>
            {activeTaskCount > 0 && (
              <span className="tab-badge" aria-label={`${activeTaskCount} active tasks`}>
                {activeTaskCount}
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
            title="Inspect autonomous cognitive agents and capabilities"
          >
            <UsersIcon size={16} />
            <span>Agent Fleet</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Search and inspect past workflow execution artifacts"
          >
            <HistoryIcon size={16} />
            <span>Task Archive</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            title="View system telemetry, latency benchmarks, and agent utilization"
          >
            <BarChartIcon size={16} />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Header Action Controls */}
        <div className="header-actions">
          <button
            className={`action-btn-icon ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound telemetry ON (Click to mute)' : 'Sound telemetry MUTED (Click to unmute)'}
            aria-label="Toggle telemetry sound"
          >
            {soundEnabled ? <VolumeIcon size={18} /> : <VolumeXIcon size={18} />}
          </button>

          <button
            className="btn-quick-launch"
            onClick={onQuickNewTask}
            title="Quick launch new workflow"
          >
            <PlusIcon size={15} />
            <span>New Workflow</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;