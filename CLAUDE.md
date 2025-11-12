# CLAUDE.md - 8192 Game

**Project**: 8192 - Turn-Based Strategy Game
**Status**: Production-Ready Kubernetes Deployment
**URL**: https://8192.lab.hq.solidrust.net
**Shaun's Golden Rule**: No workarounds, no temp fixes, complete solutions only

---

## ⚡ AGENT QUICK START

**You are working on**: 8192 Game - A turn-based strategy game with microservices architecture deployed on Kubernetes

**Key facts in 30 seconds**:
- **Frontend**: React 18 SPA (TypeScript) served via Node.js 'serve'
- **Backend**: 12+ Node.js microservices (game-logic, AI, economy, social, etc.)
- **Datastores**: MongoDB (game state) + Redis (caching/sessions)
- **Deployment**: Kubernetes on srt-hq-k8s platform with 15+ services
- **Access**: https://8192.lab.hq.solidrust.net (frontend + API + WebSocket)
- **Architecture**: API Gateway pattern with microservices

**Common tasks**:
- Deploy: `cd manifests/apps/srt-8192 && .\deploy.ps1`
- Build images: `.\build-and-push.ps1 -Login -Push`
- View logs: `kubectl logs -n srt-8192 -l app=frontend`
- Check status: `kubectl get all -n srt-8192`

---

## 📚 PLATFORM INTEGRATION (ChromaDB Knowledge Base)

**When working in this submodule**, you cannot access the parent srt-hq-k8s repository files. Use ChromaDB to query platform capabilities and integration patterns.

**Collection**: `srt-hq-k8s-platform-guide` (43 docs, updated 2025-11-11)

**Why This Matters for 8192 Game**:
The 8192 game is a complex microservices application that integrates deeply with the srt-hq-k8s platform:
- **Ingress**: Uses nginx-ingress with TLS (cert-manager DNS-01) for HTTPS access
- **Storage**: Requires persistent volumes (openebs-hostpath) for MongoDB and Redis data
- **Networking**: Internal ClusterIP services for 12+ microservices + API gateway
- **Monitoring**: Prometheus/Grafana integration for game metrics and performance
- **WebSocket**: Nginx ingress configured for real-time game updates

**Query When You Need**:
- Platform architecture and three-tier taxonomy
- Storage classes and PVC configuration patterns
- Ingress patterns for HTTPS with cert-manager
- Service networking (ClusterIP vs LoadBalancer)
- Monitoring integration (Prometheus exporters)
- Platform resource limits and node selectors

**Example Queries**:
```
"What is the srt-hq-k8s platform architecture?"
"How do I configure persistent storage for StatefulSets?"
"What is the ingress pattern for HTTPS with cert-manager?"
"How do I expose services internally vs externally?"
"What monitoring tools are available on the platform?"
```

**When NOT to Query**:
- ❌ React development (use frontend/README.md)
- ❌ Game logic implementation (see backend/services/game-logic-service/)
- ❌ Docker build process (use build-and-push.ps1)
- ❌ Kubernetes manifest syntax (standard K8s documentation)

**How to Query ChromaDB**:
```typescript
// Example: Query platform storage patterns
const results = await mcp__chroma__chroma_query_documents({
  collection_name: "srt-hq-k8s-platform-guide",
  query_texts: ["persistent volume configuration for StatefulSets"],
  n_results: 3
});
```

---

## 📍 PROJECT OVERVIEW

**What is 8192?**
A turn-based strategy game similar to 2048 but with higher numbers (up to 8192), featuring:
- Multiplayer gameplay with matchmaking
- AI opponents with difficulty levels
- Economy system with in-game currency
- Social features (friends, leaderboards, achievements)
- Tutorial system for onboarding
- Real-time notifications via WebSocket

**Why Microservices?**
- **Scalability**: Scale individual services based on load (e.g., more game-logic pods during peak)
- **Maintainability**: Each service has single responsibility (easier to update)
- **Resilience**: Service failures are isolated (AI service down doesn't break leaderboard)
- **Development**: Teams can work independently on different services

**Business Context** (from parent CLAUDE.md):
This infrastructure demonstrates technical credibility for investor-ready business. The game serves as:
- **Reference implementation** of microservices on K8s
- **Technical showcase** for cloud-native development
- **Revenue opportunity** as part of gaming platform portfolio

---

## 🗂️ LOCATIONS

### Repository Locations
- **Standalone**: `/mnt/c/Users/shaun/repos/srt-8192`
- **Submodule**: `/mnt/c/Users/shaun/repos/srt-hq-k8s/manifests/apps/srt-8192`
- **Remote**: `git@github.com:SolidRusT/srt-8192.git`

### Deployment URLs
- **Production**: https://8192.lab.hq.solidrust.net
- **API Endpoint**: https://8192.lab.hq.solidrust.net/api
- **WebSocket**: wss://8192.lab.hq.solidrust.net/ws

### Docker Images
- **Base**: `suparious/srt-8192-base:latest`
- **Frontend**: `suparious/srt-8192-frontend:latest`
- **API Gateway**: `suparious/srt-8192-api-gateway:latest`
- **Services**: `suparious/srt-8192-{service-name}:latest` (12 images)

---

## 🛠️ TECH STACK

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: react-scripts (Create React App pattern)
- **Routing**: react-router-dom v6
- **Server**: Node.js 'serve' package (production)
- **Container**: Node 18 Alpine (multi-stage build)

### Backend Microservices
- **Language**: TypeScript (Node.js 22)
- **Base Image**: Custom `srt-8192/base-service:latest` (shared by all services)
- **Services** (13 total):
  1. **api-gateway** (port 5000) - Main entry point, routes to services
  2. **game-logic-service** - Core game mechanics (moves, merges, scoring)
  3. **ai-service** - AI opponent logic
  4. **data-integration** - External data sync
  5. **economy-management** - In-game currency, purchases
  6. **leaderboard-service** - Rankings and scores
  7. **matchmaking-service** - Player matching
  8. **notification-service** - Push notifications
  9. **persistence-service** - Game state saves
  10. **rewards-service** - Achievements, daily rewards
  11. **social-service** - Friends, chat, social features
  12. **tutorial-service** - Onboarding flow
  13. **user-service** - User profiles, authentication

### Datastores
- **MongoDB 7**: Primary database (game state, users, leaderboards)
- **Redis 7**: Caching, session storage, real-time data

### Infrastructure
- **Kubernetes**: srt-hq-k8s platform (12-node Talos cluster)
- **Ingress**: nginx-ingress with TLS (Let's Encrypt DNS-01)
- **Storage**: OpenEBS hostpath (persistent volumes for MongoDB + Redis)
- **Monitoring**: Prometheus + Grafana (platform-level)

---

## 📁 PROJECT STRUCTURE

```
srt-8192/
├── frontend/                      # React 18 SPA
│   ├── src/                      # React components, pages, hooks
│   ├── public/                   # Static assets
│   ├── Dockerfile                # Multi-stage: node build → serve
│   ├── package.json              # react-scripts, react-router-dom
│   └── scripts/                  # Environment generation
│
├── backend/
│   ├── services/
│   │   ├── base/                 # Base service image (all services extend)
│   │   │   ├── Dockerfile        # Node 22 + TypeScript build
│   │   │   ├── docker-entrypoint.sh
│   │   │   └── src/              # Shared utilities, health checks
│   │   │
│   │   ├── api-gateway/          # Main entry point (port 5000)
│   │   ├── game-logic-service/   # Core game mechanics
│   │   ├── ai-service/           # AI opponents
│   │   ├── data-integration/     # Data sync
│   │   ├── economy-management/   # Currency, purchases
│   │   ├── leaderboard-service/  # Rankings
│   │   ├── matchmaking-service/  # Player matching
│   │   ├── notification-service/ # Notifications
│   │   ├── persistence-service/  # Game saves
│   │   ├── rewards-service/      # Achievements
│   │   ├── social-service/       # Social features
│   │   ├── tutorial-service/     # Onboarding
│   │   └── user-service/         # User management
│   │
│   ├── shared/                   # Shared libraries (types, utils)
│   └── lib/                      # Common packages
│
├── k8s/                          # Kubernetes manifests
│   ├── 01-namespace.yaml         # srt-8192 namespace
│   ├── 02-mongodb.yaml           # StatefulSet + PVC (10Gi)
│   ├── 03-redis.yaml             # StatefulSet + PVC (5Gi)
│   ├── 04-backend-services.yaml  # All 12 microservices (Deployments)
│   ├── 05-api-gateway.yaml       # API Gateway (Deployment + Service)
│   ├── 06-frontend.yaml          # Frontend (Deployment + Service)
│   └── 07-ingress.yaml           # HTTPS ingress with TLS
│
├── build-and-push.ps1            # Build all Docker images
├── deploy.ps1                    # Deploy to Kubernetes
├── CLAUDE.md                     # This file - agent context
├── README-K8S.md                 # Deployment-focused documentation
├── docker-compose.yml            # Local development setup
└── package.json                  # Root workspace config
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Local Development (Docker Compose)

```bash
# First time setup
npm install
npm run setup

# Start all services (dev mode with hot reload)
npm run dev

# Access
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:5000
# - MongoDB: mongodb://localhost:27017
# - Redis: redis://localhost:6379
# - Mongo Express: http://localhost:8081
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
```

### Docker Build (Individual Testing)

```powershell
# Build and test frontend locally
cd frontend
docker build -t srt-8192-frontend-test .
docker run --rm -p 8080:3000 srt-8192-frontend-test
# Access: http://localhost:8080

# Build base service
cd backend/services/base
docker build -t srt-8192/base-service:latest .

# Build a specific backend service
cd backend/services/api-gateway
docker build -t srt-8192-api-gateway-test .
docker run --rm -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/srt8192 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  srt-8192-api-gateway-test
```

### Production Build (All Images)

```powershell
# From submodule directory
cd manifests/apps/srt-8192

# Build all images (base + 12 services + frontend = 14 images)
.\build-and-push.ps1

# Build and push to Docker Hub
.\build-and-push.ps1 -Login -Push

# Build single service
.\build-and-push.ps1 -ServiceOnly frontend
.\build-and-push.ps1 -ServiceOnly api-gateway
```

---

## 📋 DEPLOYMENT

### Quick Deploy

```powershell
# Deploy everything (using existing images)
cd manifests/apps/srt-8192
.\deploy.ps1

# Build, push, and deploy
.\deploy.ps1 -Build -Push

# Uninstall
.\deploy.ps1 -Uninstall
```

### Manual Deployment

```bash
# Apply manifests in order (dependencies matter)
kubectl apply -f k8s/01-namespace.yaml
kubectl apply -f k8s/02-mongodb.yaml
kubectl apply -f k8s/03-redis.yaml

# Wait for datastores to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n srt-8192 --timeout=5m
kubectl wait --for=condition=ready pod -l app=redis -n srt-8192 --timeout=5m

# Deploy backend services + gateway + frontend
kubectl apply -f k8s/04-backend-services.yaml
kubectl apply -f k8s/05-api-gateway.yaml
kubectl apply -f k8s/06-frontend.yaml

# Deploy ingress
kubectl apply -f k8s/07-ingress.yaml

# Check rollout status
kubectl rollout status deployment/frontend -n srt-8192
kubectl rollout status deployment/api-gateway -n srt-8192
```

### Deployment Architecture

```
INTERNET
    ↓
INGRESS (nginx + TLS)
172.20.75.200:443
    ↓
┌─────────────────────────────────┐
│  Path Routing:                  │
│  /     → Frontend (3000)        │
│  /api  → API Gateway (5000)     │
│  /ws   → API Gateway (5000)     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  API GATEWAY (3 replicas)       │
│  Routes to 12 backend services  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│  BACKEND SERVICES (2 replicas each)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Game     │  │ AI       │  │ Economy  │ ... │
│  │ Logic    │  │ Service  │  │ Mgmt     │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  DATASTORES                     │
│  ┌──────────┐  ┌──────────┐   │
│  │ MongoDB  │  │ Redis    │   │
│  │ (10Gi)   │  │ (5Gi)    │   │
│  └──────────┘  └──────────┘   │
└─────────────────────────────────┘
```

**Key Points**:
- **Frontend**: 3 replicas for HA, serves React SPA
- **API Gateway**: 3 replicas, handles all client requests, routes to services
- **Backend Services**: 2 replicas each (24 pods total), internal ClusterIP services
- **MongoDB/Redis**: 1 replica each (StatefulSets with persistent volumes)
- **Total Pods**: ~30 (3 frontend + 3 gateway + 24 backend + 2 datastores)

---

## 🔧 COMMON TASKS

### View Logs

```bash
# Frontend logs
kubectl logs -n srt-8192 -l app=frontend --tail=100 -f

# API Gateway logs
kubectl logs -n srt-8192 -l app=api-gateway --tail=100 -f

# Specific backend service
kubectl logs -n srt-8192 -l app=game-logic --tail=100 -f

# MongoDB logs
kubectl logs -n srt-8192 mongodb-0 --tail=100 -f

# Redis logs
kubectl logs -n srt-8192 redis-0 --tail=100 -f

# All pods in namespace
kubectl logs -n srt-8192 --all-containers=true --tail=100 -f
```

### Update Deployment

```bash
# Update image for frontend
kubectl set image deployment/frontend frontend=suparious/srt-8192-frontend:latest -n srt-8192
kubectl rollout status deployment/frontend -n srt-8192

# Update specific backend service
kubectl set image deployment/game-logic game-logic=suparious/srt-8192-game-logic-service:latest -n srt-8192

# Restart deployment (pull latest image)
kubectl rollout restart deployment/frontend -n srt-8192

# Restart all deployments
kubectl rollout restart deployment -n srt-8192
```

### Scale Services

```bash
# Scale frontend for higher load
kubectl scale deployment/frontend --replicas=5 -n srt-8192

# Scale API gateway
kubectl scale deployment/api-gateway --replicas=5 -n srt-8192

# Scale specific backend service (e.g., game-logic during peak)
kubectl scale deployment/game-logic --replicas=4 -n srt-8192
```

### Database Access

```bash
# MongoDB shell
kubectl exec -it mongodb-0 -n srt-8192 -- mongosh

# MongoDB: Show databases
kubectl exec -it mongodb-0 -n srt-8192 -- mongosh --eval "show dbs"

# MongoDB: Show collections
kubectl exec -it mongodb-0 -n srt-8192 -- mongosh srt8192 --eval "show collections"

# Redis CLI
kubectl exec -it redis-0 -n srt-8192 -- redis-cli

# Redis: Check keys
kubectl exec -it redis-0 -n srt-8192 -- redis-cli --eval "KEYS *"
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

# Check certificate status (TLS)
kubectl describe certificate srt-8192-tls -n srt-8192

# Check ingress
kubectl describe ingress srt-8192 -n srt-8192

# Port-forward for local testing
kubectl port-forward -n srt-8192 svc/frontend 8080:3000
kubectl port-forward -n srt-8192 svc/api-gateway 8081:5000
kubectl port-forward -n srt-8192 svc/mongodb 27017:27017
```

---

## 🎯 USER PREFERENCES (CRITICAL)

**Context**: Shaun is a cloud engineer learning K8s for work, building production-quality lab

**Solutions Must Be**:
- ✅ Complete, immediately deployable, production-ready
- ✅ Reproducible via destroy-and-recreate or deploy scripts
- ✅ Full manifests (not patches), no manual kubectl edits
- ✅ Properly documented in CLAUDE.md and README-K8S.md
- ❌ NO workarounds, temp files, disabled features, cruft

**Workflow**:
- Shaun monitors changes in real-time, stops/corrects anything off-vision
- Use deploy.ps1 for deployment (don't manually kubectl apply)
- Validate end-to-end before marking complete
- Document architectural decisions in this CLAUDE.md

**Code Quality**:
- No placeholders or "TODO" comments in production code
- Environment variables properly configured
- Health checks and resource limits defined
- Security: no root users, proper RBAC if needed

---

## 💡 KEY DECISIONS

### Why Microservices?
**Decision**: Split game into 13 services instead of monolith
**Rationale**:
- **Scalability**: Scale game-logic independently from social features
- **Team Development**: Multiple developers work on different services
- **Fault Isolation**: AI service failure doesn't break entire game
- **Technology Flexibility**: Can rewrite individual services without full rewrite

**Trade-offs**:
- More complex deployment (30 pods vs 1)
- Network latency between services
- More complex monitoring and debugging

### Why Not Nginx for Frontend?
**Decision**: Use Node.js 'serve' package instead of nginx
**Rationale**:
- Existing Dockerfile already uses 'serve'
- Simpler health checks (HTTP /health endpoint)
- Consistent with docker-compose local development
- 'serve' handles SPA routing correctly out-of-box

**Trade-off**: Slightly higher memory usage vs nginx (256Mi vs 128Mi)

### Why Headless Services for Datastores?
**Decision**: ClusterIP None for MongoDB and Redis StatefulSets
**Rationale**:
- StatefulSets need stable network identities (mongodb-0, redis-0)
- Headless service provides DNS records for each pod
- Required for StatefulSet pod discovery

### Why 2 Replicas for Backend Services?
**Decision**: All backend services run 2 replicas minimum
**Rationale**:
- High availability (one pod failure doesn't break service)
- Rolling updates without downtime
- Load distribution for concurrent requests

**Can scale up**: For high-traffic services (game-logic, api-gateway), scale to 4-5 replicas during peak

### Why 10Gi for MongoDB?
**Decision**: MongoDB PVC is 10Gi, Redis is 5Gi
**Rationale**:
- MongoDB stores game state, users, leaderboards (primary datastore)
- Redis only caches and sessions (temporary data)
- OpenEBS hostpath storage has plenty of capacity (8TB+ available)

**Can expand**: If game grows to millions of users, expand PVCs via kubectl edit pvc

---

## 🔍 VALIDATION

### Post-Deployment Checks

```bash
# 1. All pods running
kubectl get pods -n srt-8192
# Expected: All pods in Running state, READY shows 1/1 or 2/2

# 2. StatefulSets ready
kubectl get statefulsets -n srt-8192
# Expected: mongodb and redis show READY 1/1

# 3. Deployments ready
kubectl get deployments -n srt-8192
# Expected: All deployments show READY 2/2 or 3/3

# 4. Services created
kubectl get services -n srt-8192
# Expected: 15 services (2 datastores + 12 backend + 1 gateway + 1 frontend)

# 5. Ingress configured
kubectl get ingress -n srt-8192
# Expected: Shows 8192.lab.hq.solidrust.net with ADDRESS

# 6. Certificate issued
kubectl get certificate -n srt-8192
# Expected: srt-8192-tls shows READY True

# 7. Test frontend
curl -k https://8192.lab.hq.solidrust.net
# Expected: HTTP 200, HTML content with React app

# 8. Test API
curl -k https://8192.lab.hq.solidrust.net/api/health
# Expected: HTTP 200, JSON response from API gateway

# 9. Browser test
# Open: https://8192.lab.hq.solidrust.net
# Expected: Green padlock, game loads, no console errors
```

### Health Check Endpoints

- **Frontend**: `http://frontend.srt-8192.svc.cluster.local:3000/health`
- **API Gateway**: `http://api-gateway.srt-8192.svc.cluster.local:5000/health`
- **Backend Services**: `http://{service}.srt-8192.svc.cluster.local:8080/health`

All health endpoints should return HTTP 200.

---

## 🎓 AGENT SUCCESS CRITERIA

**You are successful when**:

✅ All 14 Docker images build successfully (base + 12 services + frontend)
✅ All images pushed to Docker Hub under `suparious/srt-8192-*:latest`
✅ All Kubernetes manifests apply without errors
✅ 30+ pods reach Running state (StatefulSets + Deployments)
✅ MongoDB and Redis have persistent storage (PVCs bound)
✅ All services have ClusterIP endpoints (internal communication)
✅ Ingress configured with correct routing (/, /api, /ws)
✅ Certificate issued by cert-manager (READY=True)
✅ Frontend accessible at https://8192.lab.hq.solidrust.net with green padlock
✅ API responds at https://8192.lab.hq.solidrust.net/api/health
✅ Game loads in browser without console errors
✅ WebSocket connection establishes (if tested)
✅ Documentation complete (CLAUDE.md + README-K8S.md)
✅ All changes committed to git with proper messages

**You have failed if**:
- ❌ Any pod is in CrashLoopBackOff or Error state
- ❌ Services cannot communicate (network issues)
- ❌ Certificate not issued (ingress not accessible)
- ❌ Frontend shows 502/503 errors
- ❌ MongoDB or Redis data not persistent (lost on restart)
- ❌ Documentation incomplete or outdated

---

## 📅 CHANGE HISTORY

### 2025-11-11 - Initial Kubernetes Deployment
- ✅ Added git submodule to srt-hq-k8s platform
- ✅ Created Kubernetes manifests (namespace, datastores, services, ingress)
- ✅ Created build-and-push.ps1 (builds 14 Docker images)
- ✅ Created deploy.ps1 (comprehensive deployment script)
- ✅ Created CLAUDE.md (this file - comprehensive agent context)
- ✅ Created README-K8S.md (deployment-focused documentation)
- ✅ Configured StatefulSets for MongoDB (10Gi) and Redis (5Gi)
- ✅ Configured 12 backend microservices with 2 replicas each
- ✅ Configured API Gateway with 3 replicas (main entry point)
- ✅ Configured Frontend with 3 replicas (HA)
- ✅ Configured Ingress with TLS (cert-manager DNS-01)
- ✅ Configured WebSocket support (nginx ingress annotations)
- ✅ Updated parent repo configuration (submodule, sync scripts, CLAUDE.md)

---

**Last Updated**: 2025-11-11
**Maintained By**: Shaun Prince
**Platform**: srt-hq-k8s (12-node Talos Kubernetes cluster)
**Deployment Tier**: Platform Apps (`manifests/apps/`)
