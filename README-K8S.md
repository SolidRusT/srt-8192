# 8192 Game - Kubernetes Deployment

**Turn-based strategy game with microservices architecture**

Production URL: https://8192.lab.hq.solidrust.net

---

## 🚀 Quick Start

### Deploy to Kubernetes

```powershell
# From srt-hq-k8s submodule directory
cd manifests/apps/srt-8192

# Deploy using existing images
.\deploy.ps1

# Build, push, and deploy
.\deploy.ps1 -Build -Push
```

### Build Docker Images

```powershell
# Build all 14 images (base + 12 services + frontend)
.\build-and-push.ps1

# Build and push to Docker Hub
.\build-and-push.ps1 -Login -Push

# Build single service
.\build-and-push.ps1 -ServiceOnly frontend
```

### Local Development

```bash
# From standalone repository
cd /mnt/c/Users/shaun/repos/srt-8192

# First time setup
npm install
npm run setup

# Start all services with docker-compose
npm run dev
```

---

## 📦 Architecture

### Services Overview

| Service | Replicas | Port | Purpose |
|---------|----------|------|---------|
| **Frontend** | 3 | 3000 | React SPA (game UI) |
| **API Gateway** | 3 | 5000 | Main entry point, routing |
| **game-logic** | 2 | 8080 | Core game mechanics |
| **ai-service** | 2 | 8080 | AI opponents |
| **data-integration** | 2 | 8080 | Data sync |
| **economy** | 2 | 8080 | Currency, purchases |
| **leaderboard** | 2 | 8080 | Rankings |
| **matchmaking** | 2 | 8080 | Player matching |
| **notifications** | 2 | 8080 | Push notifications |
| **persistence** | 2 | 8080 | Game saves |
| **rewards** | 2 | 8080 | Achievements |
| **social** | 2 | 8080 | Friends, chat |
| **tutorial** | 2 | 8080 | Onboarding |
| **user** | 2 | 8080 | User management |
| **MongoDB** | 1 | 27017 | Primary datastore (10Gi) |
| **Redis** | 1 | 6379 | Cache, sessions (5Gi) |

**Total**: ~30 pods

### Network Flow

```
INTERNET → INGRESS (nginx + TLS)
    ↓
    ├─ / → Frontend (React SPA)
    ├─ /api → API Gateway
    └─ /ws → API Gateway (WebSocket)
        ↓
        API Gateway routes to 12 backend services
            ↓
            MongoDB + Redis
```

---

## 🛠️ Maintenance

### View Logs

```bash
# Frontend
kubectl logs -n srt-8192 -l app=frontend --tail=100 -f

# API Gateway
kubectl logs -n srt-8192 -l app=api-gateway --tail=100 -f

# Specific service
kubectl logs -n srt-8192 -l app=game-logic --tail=100 -f

# MongoDB
kubectl logs -n srt-8192 mongodb-0 --tail=100 -f

# All services
kubectl logs -n srt-8192 --all-containers=true --tail=50
```

### Update Deployment

```bash
# Update image (rebuilds and redeploys)
cd manifests/apps/srt-8192
.\build-and-push.ps1 -ServiceOnly frontend -Push
kubectl rollout restart deployment/frontend -n srt-8192

# Restart all deployments (pull latest images)
kubectl rollout restart deployment -n srt-8192

# Check rollout status
kubectl rollout status deployment/frontend -n srt-8192
```

### Scale Services

```bash
# Scale frontend for higher load
kubectl scale deployment/frontend --replicas=5 -n srt-8192

# Scale API gateway
kubectl scale deployment/api-gateway --replicas=5 -n srt-8192

# Scale backend service
kubectl scale deployment/game-logic --replicas=4 -n srt-8192
```

### Database Access

```bash
# MongoDB shell
kubectl exec -it mongodb-0 -n srt-8192 -- mongosh

# Redis CLI
kubectl exec -it redis-0 -n srt-8192 -- redis-cli
```

### Troubleshooting

```bash
# Check all resources
kubectl get all,pvc,ingress,certificate -n srt-8192

# Check pod status
kubectl get pods -n srt-8192 -o wide

# Describe problematic pod
kubectl describe pod <pod-name> -n srt-8192

# Check events
kubectl get events -n srt-8192 --sort-by='.lastTimestamp'

# Check certificate
kubectl describe certificate srt-8192-tls -n srt-8192

# Port-forward for local testing
kubectl port-forward -n srt-8192 svc/frontend 8080:3000
kubectl port-forward -n srt-8192 svc/api-gateway 8081:5000
```

---

## 📋 Tech Stack

**Frontend**: React 18 + TypeScript + react-scripts
**Backend**: Node.js 22 + TypeScript (13 microservices)
**Datastores**: MongoDB 7 + Redis 7
**Container**: Docker (multi-stage builds)
**Orchestration**: Kubernetes (Talos v1.11.3)
**Ingress**: nginx-ingress + cert-manager (Let's Encrypt DNS-01)
**Storage**: OpenEBS hostpath (persistent volumes)

---

## 🗂️ Files Overview

```
manifests/apps/srt-8192/
├── k8s/                       # Kubernetes manifests
│   ├── 01-namespace.yaml      # srt-8192 namespace
│   ├── 02-mongodb.yaml        # StatefulSet + PVC (10Gi)
│   ├── 03-redis.yaml          # StatefulSet + PVC (5Gi)
│   ├── 04-backend-services.yaml  # 12 microservices
│   ├── 05-api-gateway.yaml    # API Gateway
│   ├── 06-frontend.yaml       # React frontend
│   └── 07-ingress.yaml        # HTTPS ingress
│
├── frontend/                  # React SPA
│   ├── src/                   # Components, pages, hooks
│   ├── Dockerfile             # Multi-stage build
│   └── package.json           # Dependencies
│
├── backend/
│   └── services/
│       ├── base/              # Base image (all services extend)
│       ├── api-gateway/       # Main entry point
│       ├── game-logic-service/  # Core game mechanics
│       ├── ai-service/        # AI opponents
│       ├── [10 more services]/
│       └── ...
│
├── build-and-push.ps1         # Build all Docker images
├── deploy.ps1                 # Deploy to Kubernetes
├── CLAUDE.md                  # Comprehensive agent context
├── README-K8S.md              # This file
└── docker-compose.yml         # Local development
```

---

## 🎯 Useful Commands

```bash
# Check deployment status
kubectl get all -n srt-8192

# Watch pod status
kubectl get pods -n srt-8192 -w

# Check certificate status
kubectl get certificate -n srt-8192

# View all logs
kubectl logs -n srt-8192 --all-containers=true --tail=100 -f

# Restart all services
kubectl rollout restart deployment -n srt-8192

# Delete deployment (WARNING: deletes persistent data)
cd manifests/apps/srt-8192
.\deploy.ps1 -Uninstall
```

---

## 🔗 Links

- **Production**: https://8192.lab.hq.solidrust.net
- **API**: https://8192.lab.hq.solidrust.net/api
- **WebSocket**: wss://8192.lab.hq.solidrust.net/ws
- **Docker Hub**: https://hub.docker.com/u/suparious
- **GitHub**: https://github.com/SolidRusT/srt-8192

---

## 📚 Additional Documentation

- **CLAUDE.md**: Comprehensive agent context (architecture, decisions, workflows)
- **Parent Platform**: See `/mnt/c/Users/shaun/repos/srt-hq-k8s/CLAUDE.md` for platform details
- **Game Design**: See `docs/Game_Design_Bible.md` in standalone repository

---

**Last Updated**: 2025-11-11
**Status**: Production-Ready
**Platform**: srt-hq-k8s (12-node Kubernetes cluster)
