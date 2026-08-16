export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  model: string;
  status: 'idle' | 'thinking' | 'executing' | 'offline';
  capabilities: string[];
  systemPrompt: string;
  tasksCompleted?: number;
}

export interface TaskStep {
  stepNumber: number;
  name: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  thought?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentColor: string;
  type: 'thought' | 'action' | 'output' | 'system' | 'deliverable';
  content: string;
}

export interface Task {
  id: string;
  title: string;
  goal: string;
  pipelineType: 'full_collaboration' | 'quick_plan' | 'code_review' | 'research_only';
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  assignedAgents: string[];
  steps: TaskStep[];
  logs: TaskLog[];
  deliverable?: string;
  executionTimeMs?: number;
  createdAt: string;
  completedAt?: string;
}

export interface SystemStats {
  agentsTotal: number;
  tasksTotal: number;
  activeTasks: number;
  mongoStatus: string;
  redisStatus: string;
  fleetStatus: string;
  timestamp: string;
}
