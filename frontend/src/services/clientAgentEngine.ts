import { Task, TaskLog, Agent, SystemStats } from '../types';

export const DEFAULT_CLIENT_AGENTS: Agent[] = [
  {
    id: 'agent-architect',
    name: 'Atlas',
    role: 'Lead Architect & Planner',
    description: 'Decomposes complex objectives into structured execution plans, dependency graphs, and architecture specifications.',
    avatar: '🧠',
    color: '#6366f1',
    model: 'gpt-4o / claude-3-7-sonnet',
    status: 'idle',
    capabilities: ['Architecture Design', 'Task Decomposition', 'System Modeling', 'Workflow Strategy'],
    systemPrompt: 'You are Atlas, the Lead Systems Architect. You analyze high-level user requirements and design robust, modular multi-step execution plans.'
  },
  {
    id: 'agent-researcher',
    name: 'Nova',
    role: 'Senior Research Analyst',
    description: 'Performs deep technical domain analysis, evaluates trade-offs, identifies best practices, and gathers context.',
    avatar: '🔍',
    color: '#06b6d4',
    model: 'gpt-4o / perplexity-sonar',
    status: 'idle',
    capabilities: ['Domain Research', 'Technology Benchmarking', 'API Discovery', 'Risk Assessment'],
    systemPrompt: 'You are Nova, the Senior Research Analyst. You gather relevant specifications, explore design patterns, and provide actionable context.'
  },
  {
    id: 'agent-coder',
    name: 'Cypher',
    role: 'Principal Systems Engineer',
    description: 'Generates robust, idiomatic, and production-grade code, configuration files, and automated deployment manifests.',
    avatar: '⚡',
    color: '#10b981',
    model: 'gpt-4o / deepseek-coder-v2',
    status: 'idle',
    capabilities: ['Code Synthesis', 'Refactoring', 'API Integration', 'Docker & K8s Configuration'],
    systemPrompt: 'You are Cypher, the Principal Software Engineer. You write clean, testable, and optimized implementation code and configuration.'
  },
  {
    id: 'agent-reviewer',
    name: 'Aegis',
    role: 'QA & Security Auditor',
    description: 'Inspects code and architectures for vulnerabilities, edge cases, performance bottlenecks, and verification criteria.',
    avatar: '🛡️',
    color: '#f59e0b',
    model: 'gpt-4o / claude-3-7-sonnet',
    status: 'idle',
    capabilities: ['Static Analysis', 'Security Auditing', 'Edge Case Detection', 'Quality Certification'],
    systemPrompt: 'You are Aegis, the Security and QA Auditor. You rigorously inspect all deliverables for resilience, safety, and correctness.'
  }
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getLocalTasks(): Task[] {
  try {
    const data = localStorage.getItem('nexus_orchestrate_tasks');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks: Task[]): void {
  try {
    localStorage.setItem('nexus_orchestrate_tasks', JSON.stringify(tasks.slice(0, 30)));
  } catch {
    // Ignore localStorage write quota errors
  }
}

export function getLocalStats(tasks: Task[]): SystemStats {
  const active = tasks.filter((t) => t.status === 'in_progress').length;
  return {
    agentsTotal: DEFAULT_CLIENT_AGENTS.length,
    tasksTotal: tasks.length,
    activeTasks: active,
    mongoStatus: 'healthy',
    redisStatus: 'healthy',
    fleetStatus: 'operational',
    timestamp: new Date().toISOString()
  };
}

export async function runClientSimulation(
  task: Task,
  onLog: (log: TaskLog) => void,
  onStepCompleted: (stepNumber: number, output: string) => void,
  onCompleted: (deliverable: string, executionTimeMs: number) => void
): Promise<Task> {
  const startTime = Date.now();

  const createLog = (
    agentId: string,
    agentName: string,
    avatar: string,
    color: string,
    type: 'thought' | 'action' | 'output' | 'system',
    content: string
  ): TaskLog => ({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    agentId,
    agentName,
    agentAvatar: avatar,
    agentColor: color,
    type,
    content
  });

  // Phase 1: Planning (@Atlas)
  const log1 = createLog(
    'agent-architect',
    'Atlas',
    '🧠',
    '#6366f1',
    'thought',
    `Decomposing objective: "${task.goal}" into high-concurrency modular pipeline components.`
  );
  onLog(log1);
  await sleep(650);

  const log2 = createLog(
    'agent-architect',
    'Atlas',
    '🧠',
    '#6366f1',
    'action',
    `Generated system topology: 4 cognitive stages, asynchronous event bus, and resilience layer.`
  );
  onLog(log2);
  await sleep(600);

  const step1Output = `### Architecture Blueprint: ${task.title}\n- Core Goal: ${task.goal}\n- Execution Strategy: 4-Phase Distributed Neural Consensus\n- Data Relays: Server-Sent Events, In-Memory Caching, State Ledger`;
  onStepCompleted(1, step1Output);
  await sleep(500);

  // Phase 2: Research (@Nova)
  const log3 = createLog(
    'agent-researcher',
    'Nova',
    '🔍',
    '#06b6d4',
    'thought',
    `Benchmarking algorithmic trade-offs and performance constraints for "${task.title}".`
  );
  onLog(log3);
  await sleep(750);

  const log4 = createLog(
    'agent-researcher',
    'Nova',
    '🔍',
    '#06b6d4',
    'action',
    `Identified optimal pattern: Non-blocking reactive pipeline with backpressure regulation and exponential circuit breakers.`
  );
  onLog(log4);
  await sleep(650);

  const step2Output = `### Technical Specifications & Patterns\n- Latency Target: <50ms P99\n- Resilience: Circuit Breaker with Automated Retry Handlers\n- Throughput: High-density stream telemetry`;
  onStepCompleted(2, step2Output);
  await sleep(500);

  // Phase 3: Code Implementation (@Cypher)
  const log5 = createLog(
    'agent-coder',
    'Cypher',
    '⚡',
    '#10b981',
    'thought',
    `Synthesizing production TypeScript/Node.js implementation code and configuration schemas.`
  );
  onLog(log5);
  await sleep(850);

  const generatedCode = `// Autonomously engineered by NexusOrchestrate Fleet
// Target: ${task.title}

export interface OrchestrationConfig {
  taskId: string;
  concurrencyLimit: number;
  retryAttempts: number;
}

export class DistributedPipelineWorker {
  private taskId: string;
  private isProcessing = false;

  constructor(private config: OrchestrationConfig) {
    this.taskId = config.taskId;
  }

  public async executePipeline(): Promise<{ success: boolean; durationMs: number }> {
    const start = performance.now();
    this.isProcessing = true;
    
    // Process stream events with zero-overhead telemetry
    console.log(\`[Worker \${this.taskId}] Dispatched execution for: "${task.goal.replace(/"/g, '\\"')}"\`);
    
    this.isProcessing = false;
    return { success: true, durationMs: performance.now() - start };
  }
}`;

  const log6 = createLog(
    'agent-coder',
    'Cypher',
    '⚡',
    '#10b981',
    'action',
    `Engineered implementation artifact:\n\`\`\`typescript\n${generatedCode}\n\`\`\``
  );
  onLog(log6);
  await sleep(700);

  const step3Output = `### Implementation Deliverables\n- Modular worker classes compiled\n- Structured exception handling integrated\n- Reactive telemetry relay initialized`;
  onStepCompleted(3, step3Output);
  await sleep(500);

  // Phase 4: Review & Security (@Aegis)
  const log7 = createLog(
    'agent-reviewer',
    'Aegis',
    '🛡️',
    '#f59e0b',
    'thought',
    `Running automated security vulnerability audit, OWASP Top 10 check, and memory leak analysis.`
  );
  onLog(log7);
  await sleep(750);

  const log8 = createLog(
    'agent-reviewer',
    'Aegis',
    '🛡️',
    '#f59e0b',
    'action',
    `Security Certification Passed: 0 Vulnerabilities, 0 Timing Attacks detected. Quality verified 100%.`
  );
  onLog(log8);
  await sleep(500);

  const step4Output = `### Security Certification & QA\n- Audit Status: PASSED\n- Compliance: Production Ready\n- Reliability Score: 99.98%`;
  onStepCompleted(4, step4Output);
  await sleep(400);

  // Deliverable Synthesis
  const executionTimeMs = Date.now() - startTime;
  const deliverable = `# Synthesized Architecture Specification: ${task.title}\n\n**Objective**: ${task.goal}\n\n## 1. Executive Summary\nThe NexusOrchestrate autonomous agent fleet successfully coordinated across 4 cognitive phases to formulate, benchmark, implement, and certify **"${task.goal}"**.\n\n## 2. Engineered Implementation\n\`\`\`typescript\n${generatedCode}\n\`\`\`\n\n## 3. Autonomous Fleet Certification\n- **@Atlas (Lead Architect)**: System blueprint and task decomposition verified.\n- **@Nova (Research Analyst)**: Low-latency distributed caching and fault tolerance patterns approved.\n- **@Cypher (Principal Engineer)**: Production TypeScript implementation synthesized.\n- **@Aegis (Security Auditor)**: 0 Vulnerabilities. Certified Production-Ready.`;

  const finalDeliverableLog: TaskLog = {
    id: `log-deliv-${Date.now()}`,
    timestamp: new Date().toISOString(),
    agentId: 'agent-reviewer',
    agentName: 'Aegis',
    agentAvatar: '🛡️',
    agentColor: '#f59e0b',
    type: 'deliverable',
    content: deliverable
  };
  onLog(finalDeliverableLog);

  onCompleted(deliverable, executionTimeMs);

  const updatedSteps = task.steps.map((s, idx) => ({
    ...s,
    status: 'completed' as const,
    output: idx === 0 ? step1Output : idx === 1 ? step2Output : idx === 2 ? step3Output : step4Output
  }));

  const completedTask: Task = {
    ...task,
    status: 'completed',
    steps: updatedSteps,
    deliverable,
    executionTimeMs,
    completedAt: new Date().toISOString(),
    logs: [...task.logs, log1, log2, log3, log4, log5, log6, log7, log8, finalDeliverableLog]
  };

  return completedTask;
}
