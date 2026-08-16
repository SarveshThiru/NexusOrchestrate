# NexusOrchestrate — Multi-Agent AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Docker Compose](https://img.shields.io/badge/docker--compose-v2-2496ed.svg)](https://www.docker.com/)
[![Redis](https://img.shields.io/badge/redis-7.0--alpine-dc382d.svg)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.0-47a248.svg)](https://www.mongodb.com/)

**NexusOrchestrate** is an autonomous multi-agent AI orchestration platform and real-time mission control console. It coordinates specialized cognitive entities across multi-phase workflows, streaming real-time reasoning, telemetry, and code deliverables directly to a sleek Dark HUD dashboard.

---

## 🌟 Architecture Overview

NexusOrchestrate dispatches user objectives through an automated 4-phase cognitive pipeline where each agent specializes in a distinct layer of software engineering and system architecture:

```
[ User Objective / Blueprint ]
             │
             ▼
   ┌───────────────────┐
   │   @Atlas (Arch)   │  Phase 1: Task Decomposition & System Modeling
   └─────────┬─────────┘
             │ (SSE Stream / Redis PubSub)
             ▼
   ┌───────────────────┐
   │   @Nova (Research)│  Phase 2: Technical Research & Pattern Discovery
   └─────────┬─────────┘
             │ (SSE Stream / Redis PubSub)
             ▼
   ┌───────────────────┐
   │  @Cypher (Coder)  │  Phase 3: Code Implementation & Artifact Synthesis
   └─────────┬─────────┘
             │ (SSE Stream / Redis PubSub)
             ▼
   ┌───────────────────┐
   │   @Aegis (Audit)  │  Phase 4: OWASP Security Audit & QA Certification
   └─────────┬─────────┘
             │
             ▼
[ Verified Specification & Final Deliverable ]
```

---

## 🚀 Key Features

### 1. ⚡ Bento Task Launchpad
- **Curated Architectural Blueprints:** Instant presets for Distributed Systems, Zero-Trust Security, Multi-Tier Caching, Kubernetes Ingress, and Cryptographic Validators.
- **Dynamic Pipeline Selector:** Choose between Full 4-Agent Autonomous Hive, Rapid Architecture Pipeline, or Implementation & Audit Pipeline.
- **Power User Shortcuts:** Character counter, auto-scroll locks, and `Ctrl + Enter` fast-launch trigger.

### 2. 📡 Real-Time Telemetry & Live HUD
- **4-Phase Topology Visualizer:** Interactive agent nodes with live pulse indicators, status badges, and animated data packet connectors.
- **Live Terminal Log Stream:** Searchable, filterable event stream (`thought`, `action`, `output`, `deliverable`, `system`) with auto-scroll freeze mode.
- **Deliverable Specification Studio:** Formatted code preview, markdown copy, and `.md` file export.

### 3. 👥 Cognitive Agent Fleet Matrix
- **Agent Personas:** Deep breakdown of agent capabilities, system prompts, role assignments, and underlying LLM engines (`gemini-2.5-pro`, `claude-3-7-sonnet`, `deepseek-r1`, `gpt-4o`).
- **Prompt Engineering Inspector:** Modal inspector to review and copy the exact cognitive prompts driving each agent.
- **Deploy Custom Agents:** On-the-fly provisioning of new specialized agents into the active fleet.

### 4. 📜 Historical Task Archive
- Search workflows by title, goal, or ID.
- Status filters (`All`, `Completed`, `Running`, `Failed`) with execution duration benchmarks.
- One-click **Re-Run Workflow** action.

### 5. 📊 Real-Time Operations Analytics
- KPI cards tracking total executions, autonomous success rate, average pipeline latency, and active neural agents.
- Visual agent workload and contribution distribution bar meters.
- Live infrastructure heartbeat for MongoDB, Redis, and SSE event streaming.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Pure CSS3 Design Tokens, Vector SVG Icons, Web Audio API |
| **Backend API** | Node.js 20, Express, Server-Sent Events (SSE), EventEmitters |
| **Database** | MongoDB 6.0 (Mongoose ODM) |
| **Cache & Bus** | Redis 7.0 (In-Memory Pub/Sub & Telemetry Cache) |
| **Reverse Proxy** | Nginx Alpine (Unbuffered SSE Gateway) |
| **DevOps** | Docker, Docker Compose, Multi-Stage Builds |

---

## 🚦 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) **OR**
- [Node.js](https://nodejs.org/) (v18+) & [npm](https://www.npmjs.com/)

---

### Option A: Run with Docker Compose (Recommended)

To launch the full stack (Frontend, API, MongoDB, Redis, and Nginx Gateway):

```bash
# 1. Clone or navigate to the directory
cd multi-agent-docker

# 2. Build and launch all services
npm run docker:up
# or: docker compose up --build
```

Once running, access:
- **Mission Control Dashboard:** [http://localhost:80](http://localhost:80) *(or [http://localhost:8080](http://localhost:8080))*
- **Backend API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB:** `localhost:27017`
- **Redis:** `localhost:6379`

To stop all containers:
```bash
npm run docker:down
```

---

### Option B: Local Development Setup

#### 1. Install Dependencies
```bash
# Install root, API, and Frontend packages
npm install
npm install --prefix api
npm install --prefix frontend
```

#### 2. Start Services
Ensure local MongoDB and Redis instances are running, or launch them via Docker:
```bash
docker compose up -d mongo redis
```

#### 3. Run Development Servers
```bash
# In terminal 1 (API Server on port 5000):
npm run dev:api

# In terminal 2 (Frontend React Dev Server on port 3000):
npm run dev:frontend
```

---

## 🔌 API Reference

### Health & Telemetry
- `GET /api/health` — Service health check & MongoDB connection status.
- `GET /api/stats` — Real-time cluster throughput, active tasks, and fleet state.

### Cognitive Fleet
- `GET /api/agents` — List all registered agents and capabilities.
- `POST /api/agents` — Provision a new custom cognitive agent.

### Workflows & Execution
- `GET /api/tasks` — List archived workflows with pagination.
- `GET /api/tasks/:id` — Get detailed task logs and final deliverable.
- `POST /api/tasks` — Dispatch a new autonomous multi-agent workflow.
- `GET /api/tasks/:id/stream` — **Server-Sent Events (SSE)** live telemetry stream.

---

## 📂 Project Structure

```text
multi-agent-docker/
├── .docker/
│   ├── api.Dockerfile          # Multi-stage build for API service
│   └── frontend.Dockerfile     # Multi-stage build for React & Nginx
├── api/
│   ├── models/
│   │   ├── agentModel.js       # Mongoose Agent Schema
│   │   └── taskModel.js        # Mongoose Workflow & Log Schema
│   ├── services/
│   │   ├── multiAgentEngine.js # Multi-Agent Execution & Event Engine
│   │   └── redisService.js     # Redis Pub/Sub & Cache Client
│   ├── index.js                # Express API & SSE Router
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML Template & Google Fonts
│   ├── src/
│   │   ├── components/
│   │   │   ├── icons/
│   │   │   │   └── Icons.tsx   # Pure Vector SVG Icon Suite
│   │   │   ├── Header.tsx      # Mission Control Top Bar & Status
│   │   │   ├── StatsBar.tsx    # Telemetry KPI Stat Cards
│   │   │   ├── TaskLaunchpad.tsx # Blueprint Selector & Dispatch Form
│   │   │   ├── LiveWorkflowViewer.tsx # 4-Phase Graph & Terminal HUD
│   │   │   ├── AgentFleet.tsx  # Fleet Matrix & Prompt Inspector
│   │   │   ├── TaskHistory.tsx # Execution Archive & Filter List
│   │   │   └── AnalyticsView.tsx # Operations Analytics & Latency KPIs
│   │   ├── App.tsx             # Root Application & SSE Stream Manager
│   │   ├── App.css             # Dark HUD Design System & Animations
│   │   └── types.ts            # TypeScript Definitions
│   └── package.json
├── nginx/
│   └── default.conf            # Nginx Reverse Proxy (Unbuffered SSE)
├── docker-compose.yml          # Container Orchestration Spec
├── package.json                # Root Workspace Manifest
└── README.md                   # Project Documentation
```

---

## 🛡️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
