import React from 'react';
import { SystemStats } from '../types';
import {
  UsersIcon,
  ZapIcon,
  DatabaseIcon,
  ServerIcon
} from './icons/Icons';

interface StatsBarProps {
  stats: SystemStats | null;
  activeTaskCount: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats, activeTaskCount }) => {
  return (
    <div className="stats-bar" aria-label="System Telemetry Overview">
      {/* Fleet Agents */}
      <div className="stat-card">
        <div className="stat-icon-wrapper indigo">
          <UsersIcon size={22} color="var(--accent-indigo)" />
        </div>
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-value">{stats ? stats.agentsTotal : 4}</span>
            <span className="stat-badge-chip">4 NODES</span>
          </div>
          <span className="stat-label">Cognitive Agent Fleet</span>
          <span className="stat-subtext">Atlas, Nova, Cypher, Aegis</span>
        </div>
      </div>

      {/* Workflow Throughput */}
      <div className="stat-card">
        <div className="stat-icon-wrapper cyan">
          <ZapIcon size={22} color="var(--accent-cyan)" />
        </div>
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-value">{stats ? stats.tasksTotal : 0}</span>
            {activeTaskCount > 0 ? (
              <span className="stat-badge-chip active-pulse">{activeTaskCount} RUNNING</span>
            ) : (
              <span className="stat-badge-chip">IDLE</span>
            )}
          </div>
          <span className="stat-label">Total Workflows</span>
          <span className="stat-subtext">
            {activeTaskCount > 0 ? `${activeTaskCount} active in execution` : 'Standby for dispatch'}
          </span>
        </div>
      </div>

      {/* MongoDB Storage */}
      <div className="stat-card">
        <div className="stat-icon-wrapper emerald">
          <DatabaseIcon size={22} color="var(--accent-emerald)" />
        </div>
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {stats?.mongoStatus === 'healthy' ? 'Active' : 'Connected'}
            </span>
            <span className="status-dot green"></span>
          </div>
          <span className="stat-label">MongoDB Cluster</span>
          <span className="stat-subtext">Document Persistence & Archive</span>
        </div>
      </div>

      {/* Redis Engine */}
      <div className="stat-card">
        <div className="stat-icon-wrapper amber">
          <ServerIcon size={22} color="var(--accent-amber)" />
        </div>
        <div className="stat-info">
          <div className="stat-header">
            <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
              {stats?.redisStatus === 'healthy' ? 'Active' : 'Connected'}
            </span>
            <span className="status-dot green"></span>
          </div>
          <span className="stat-label">Redis Pub/Sub & Cache</span>
          <span className="stat-subtext">Real-Time Telemetry Stream</span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
