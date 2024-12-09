# 8192: Turn-Based Leadership Simulator

A sophisticated turn-based leadership simulator focused on teaching strategic thinking, resource management, and decision-making skills through engaging gameplay. The game runs in cycles of 8,192 turns, with each turn taking 73.828 seconds, creating a perfect two-week gameplay cycle.

## 🎮 Key Features

- Turn-based strategic gameplay
- Leadership skill development focus
- Adaptive AI opponent (NexusMind)
- Real-world data integration
- Persistent player progression
- Educational framework for leadership training

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn
- GNU Make (optional, for additional development commands)

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-org/srt-8192.git
cd srt-8192
```

2. Install dependencies and generate environment files:
```bash
# Using npm:
npm install
npm run generate:env

# Or using Make:
make setup
```

3. Start the development environment:
```bash
# Using npm:
npm run dev  # Builds and starts
# or
npm start    # Starts without rebuilding

# Using Make:
make dev     # Builds and starts
# or
make start   # Starts without rebuilding
```

4. Access the application:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000
- Service Health Checks: http://localhost:[5001-5012]/health

## 🔧 Development

### NPM Commands
Primary development commands:
```bash
# Environment setup
npm run generate:env          # Generate environment files

# Development
npm run dev                  # Start dev environment (with build)
npm start                    # Start without rebuilding
npm run down                 # Stop all services
npm run clean               # Clean up (remove volumes)

# Testing
npm test                    # Run all tests

# Logging
npm run logs                # View all logs
```

### Make Commands
Additional development commands available through Make:

```bash
# Get command help
make help                   # Show all available commands

# Environment
make setup                  # Install dependencies and generate env files
make generate-env          # Generate environment files
make build                 # Build all services

# Development
make start                 # Start development environment
make stop                  # Stop development environment
make dev                   # Build and start development environment

# Testing
make test SERVICE=name     # Test specific service
make test-all             # Test all services
make test-integration     # Run integration tests
make lint-all             # Run linting

# Monitoring
make health-check         # Check health of all services
make db-check            # Check database connections
make logs [SERVICE=name] # View service logs
make prod-test           # Test production environment
```

[Previous sections remain the same...]

## 🏗️ Project Structure

\`\`\`
srt-8192/
├── frontend/               # React frontend application
├── backend/               # Microservices backend
│   ├── services/         # Individual service directories
│   ├── shared/           # Shared utilities and types
│   └── scripts/          # Backend maintenance scripts
├── scripts/              # Project-wide scripts
├── Makefile             # Additional development commands
└── docker-compose.yml    # Docker composition config
\`\`\`

[Previous sections remain the same...]

## 🔍 Monitoring & Debugging

### Health Checks
Health checks can be performed in several ways:
```bash
# Using Make:
make health-check    # Check all services
make db-check       # Check databases

# Using curl:
curl http://localhost:[PORT]/health
```

### Logs
```bash
# Using npm:
npm run logs

# Using Make:
make logs                  # All services
make logs SERVICE=name    # Specific service

# Using Docker directly:
docker-compose logs [service-name]
```

[Previous troubleshooting and other sections remain the same...]