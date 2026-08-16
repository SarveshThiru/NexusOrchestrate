import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import TaskLaunchpad from './components/TaskLaunchpad';
import LiveWorkflowViewer from './components/LiveWorkflowViewer';
import AgentFleet from './components/AgentFleet';
import TaskHistory from './components/TaskHistory';
import AnalyticsView from './components/AnalyticsView';
import { Agent, Task, SystemStats } from './types';
import {
  DEFAULT_CLIENT_AGENTS,
  runClientSimulation,
  getLocalTasks,
  saveLocalTasks,
  getLocalStats
} from './services/clientAgentEngine';

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  (typeof window !== 'undefined' && window.location.port === '3000' ? 'http://localhost:5000' : '');

// Web Audio API Sound Chime Helper (No external audio file dependencies)
const playChime = (type: 'event' | 'phase' | 'completed' | 'failed') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'event') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'phase') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'completed') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === 'failed') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Ignore audio context errors on restricted autoplay
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'launchpad' | 'fleet' | 'history' | 'analytics'>('launchpad');
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_CLIENT_AGENTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        return;
      }
    } catch {
      // Fallback
    }
    setStats((prev) => prev || getLocalStats(getLocalTasks()));
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agents`);
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        return;
      }
    } catch {
      // Fallback
    }
    setAgents(DEFAULT_CLIENT_AGENTS);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (res.ok) {
        const data: Task[] = await res.json();
        if (data && data.length > 0) {
          setTasks(data);
          if (!currentTask) {
            setCurrentTask(data[0]);
          }
          return;
        }
      }
    } catch {
      // Fallback
    }
    const local = getLocalTasks();
    if (local.length > 0) {
      setTasks(local);
      if (!currentTask) {
        setCurrentTask(local[0]);
      }
    }
  }, [currentTask]);

  // Connect to SSE stream for live agent events (Server mode)
  const connectSSE = useCallback((taskId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`${API_BASE}/api/tasks/${taskId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'sync' && data.task) {
            setCurrentTask(data.task);
          } else if (data.type === 'connected' || data.type === 'system') {
            setCurrentTask((prev) => {
              if (!prev || prev.id !== taskId) return prev;
              const updatedSteps = (prev.steps || []).map((s, idx) =>
                idx === 0 && s.status === 'pending' ? { ...s, status: 'in_progress' as const } : s
              );
              return {
                ...prev,
                status: prev.status === 'queued' ? 'in_progress' : prev.status,
                steps: updatedSteps
              };
            });
          } else if (data.type === 'log') {
            if (soundEnabled) playChime('event');
            setCurrentTask((prev) => {
              if (!prev || prev.id !== taskId) return prev;
              const exists = (prev.logs || []).some((l) => l.id === data.log.id);
              const logs = exists ? prev.logs : [...(prev.logs || []), data.log];
              const updatedSteps = (prev.steps || []).map((s, idx) =>
                idx === 0 && s.status === 'pending' ? { ...s, status: 'in_progress' as const } : s
              );
              return {
                ...prev,
                status: 'in_progress',
                steps: updatedSteps,
                logs
              };
            });
          } else if (data.type === 'step_completed') {
            if (soundEnabled) playChime('phase');
            setCurrentTask((prev) => {
              if (!prev || prev.id !== taskId) return prev;
              const updatedSteps = prev.steps.map((s) =>
                s.stepNumber === data.stepNumber
                  ? { ...s, status: 'completed' as const, output: data.output }
                  : s.stepNumber === data.stepNumber + 1
                  ? { ...s, status: 'in_progress' as const }
                  : s
              );
              return { ...prev, status: 'in_progress', steps: updatedSteps };
            });
          } else if (data.type === 'completed') {
            if (soundEnabled) playChime('completed');
            setCurrentTask((prev) => {
              if (!prev || prev.id !== taskId) return prev;
              const allCompletedSteps = prev.steps.map((s) => ({ ...s, status: 'completed' as const }));
              return {
                ...prev,
                status: 'completed',
                steps: allCompletedSteps,
                deliverable: data.deliverable,
                executionTimeMs: data.executionTimeMs
              };
            });
            fetchTasks();
            fetchStats();
            fetchAgents();
            eventSource.close();
          } else if (data.type === 'failed') {
            if (soundEnabled) playChime('failed');
            setCurrentTask((prev) => {
              if (!prev || prev.id !== taskId) return prev;
              return { ...prev, status: 'failed' };
            });
            eventSource.close();
          }
        } catch (e) {
          console.error('Failed to parse SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        // SSE not supported on static host, fallback poller will manage
      };

      return eventSource;
    } catch {
      return null;
    }
  }, [soundEnabled, fetchTasks, fetchStats, fetchAgents]);

  const handleLaunchTask = async (title: string, goal: string, pipelineType: string) => {
    setIsLaunching(true);
    const taskTitle = title.trim() || goal.slice(0, 45) + (goal.length > 45 ? '...' : '');

    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, goal, pipelineType })
      });

      if (res.ok) {
        const newTask: Task = await res.json();

        // If returned already completed (Serverless Vercel execution)
        if (newTask.status === 'completed') {
          const completedSteps = (newTask.steps || []).map((s) => ({ ...s, status: 'completed' as const }));
          const finalTask = { ...newTask, steps: completedSteps };
          if (soundEnabled) playChime('completed');
          setTasks((prev) => [finalTask, ...prev.filter((t) => t.id !== finalTask.id)]);
          setCurrentTask(finalTask);
          setActiveTab('launchpad');
          fetchStats();
          fetchTasks();
          fetchAgents();
          return;
        } else {
          // In progress / streaming mode
          const steps = (newTask.steps || []).map((s, idx) =>
            idx === 0 ? { ...s, status: 'in_progress' as const } : s
          );
          const inProgTask = { ...newTask, status: 'in_progress' as const, steps };
          setTasks((prev) => [inProgTask, ...prev.filter((t) => t.id !== inProgTask.id)]);
          setCurrentTask(inProgTask);
          setActiveTab('launchpad');
          connectSSE(inProgTask.id);
          fetchStats();
          return;
        }
      }
      throw new Error(`API returned HTTP ${res.status}`);
    } catch (err) {
      console.info('Running autonomous client-side multi-agent engine...', err);

      // Autonomous Client Engine Simulation
      const initialTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: taskTitle,
        goal,
        pipelineType: pipelineType as 'full_collaboration' | 'quick_plan' | 'code_review',
        status: 'in_progress',
        assignedAgents: ['agent-architect', 'agent-researcher', 'agent-coder', 'agent-reviewer'],
        steps: [
          { stepNumber: 1, name: 'System Architecture & Task Decomposition', agentId: 'agent-architect', agentName: 'Atlas', status: 'in_progress' },
          { stepNumber: 2, name: 'Deep Technical Research & Pattern Discovery', agentId: 'agent-researcher', agentName: 'Nova', status: 'pending' },
          { stepNumber: 3, name: 'Implementation & Artifact Generation', agentId: 'agent-coder', agentName: 'Cypher', status: 'pending' },
          { stepNumber: 4, name: 'Security Audit & Quality Certification', agentId: 'agent-reviewer', agentName: 'Aegis', status: 'pending' }
        ],
        logs: [],
        createdAt: new Date().toISOString()
      };

      setCurrentTask(initialTask);
      setTasks((prev) => [initialTask, ...prev]);
      setActiveTab('launchpad');

      const completedTask = await runClientSimulation(
        initialTask,
        (log) => {
          if (soundEnabled) playChime('event');
          setCurrentTask((prev) => {
            if (!prev || prev.id !== initialTask.id) return prev;
            return {
              ...prev,
              logs: [...prev.logs, log]
            };
          });
        },
        (stepNumber, output) => {
          if (soundEnabled) playChime('phase');
          setCurrentTask((prev) => {
            if (!prev || prev.id !== initialTask.id) return prev;
            const steps = prev.steps.map((s) =>
              s.stepNumber === stepNumber
                ? { ...s, status: 'completed' as const, output }
                : s.stepNumber === stepNumber + 1
                ? { ...s, status: 'in_progress' as const }
                : s
            );
            return { ...prev, steps };
          });
        },
        () => {
          if (soundEnabled) playChime('completed');
        }
      );

      setCurrentTask(completedTask);
      setTasks((prev) => {
        const updated = [completedTask, ...prev.filter((t) => t.id !== completedTask.id)];
        saveLocalTasks(updated);
        return updated;
      });
      setStats(getLocalStats([completedTask, ...tasks]));
    } finally {
      setIsLaunching(false);
    }
  };

  // Regular periodic poll for stats/agents
  useEffect(() => {
    fetchStats();
    fetchAgents();
    fetchTasks();

    const interval = setInterval(() => {
      fetchStats();
      fetchAgents();
    }, 6000);

    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [fetchStats, fetchAgents, fetchTasks]);

  // Active Task Fallback Live Polling
  useEffect(() => {
    if (!currentTask || (currentTask.status !== 'in_progress' && currentTask.status !== 'queued')) {
      return;
    }

    const livePoll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/${currentTask.id}`);
        if (res.ok) {
          const freshTask: Task = await res.json();
          setCurrentTask(freshTask);
          if (freshTask.status === 'completed' || freshTask.status === 'failed') {
            fetchTasks();
            fetchStats();
            fetchAgents();
          }
        }
      } catch {
        // Ignore live poll errors
      }
    }, 1200);

    return () => clearInterval(livePoll);
  }, [currentTask, fetchTasks, fetchStats, fetchAgents]);

  const activeTaskCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="app-container">
      {/* HUD Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTaskCount={activeTaskCount}
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onQuickNewTask={() => setActiveTab('launchpad')}
      />

      {/* Global Telemetry Stats Bar */}
      <StatsBar stats={stats} activeTaskCount={activeTaskCount} />

      {/* Main View Area */}
      <main className="main-content-layout">
        {activeTab === 'launchpad' && (
          <div className="dashboard-grid">
            <TaskLaunchpad
              onLaunchTask={handleLaunchTask}
              isLaunching={isLaunching}
            />
            <LiveWorkflowViewer task={currentTask} isLaunching={isLaunching} />
          </div>
        )}

        {activeTab === 'fleet' && (
          <AgentFleet
            agents={agents}
            onAgentCreated={() => {
              fetchAgents();
              fetchStats();
            }}
          />
        )}

        {activeTab === 'history' && (
          <div className="dashboard-grid">
            <TaskHistory
              tasks={tasks}
              selectedTaskId={currentTask?.id || null}
              onSelectTask={(task) => {
                setCurrentTask(task);
                setActiveTab('launchpad');
              }}
              onRerunTask={(title, goal, pipelineType) => {
                handleLaunchTask(title, goal, pipelineType);
              }}
            />
            <LiveWorkflowViewer task={currentTask} isLaunching={isLaunching} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            tasks={tasks}
            agents={agents}
          />
        )}
      </main>
    </div>
  );
};

export default App;