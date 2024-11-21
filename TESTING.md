# Testing the Future Earth Stack

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Make (optional, for using Makefile commands)

## Building the Base Image

Before running the stack, build the base service image:

```bash
# From the backend/services/base directory
docker build -t srt-8192/base-service -f Dockerfile .
```

## Launch Development Environment

Start the complete environment with hot-reloading enabled:

```bash
# From the root directory
docker compose -p future-earth-dev up --build -d
```

## Testing Individual Services

### Backend Services Testing

Each service can be tested in isolation or as part of the integrated stack.

#### 1. Individual Service Testing

```bash
# Example for AI Service
cd backend/services/ai-service

# Install dependencies
npm install

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run linting
npm run lint
```

#### 2. Container-based Testing

Access and test services running in containers:

```bash
# Access AI Service container
docker exec -it future-earth-dev-ai-service-1 sh

# Run tests inside container
npm run test
```

#### 3. Health Check Verification

Verify service health endpoints:

```bash
# Example for AI Service
curl http://localhost:5002/health

# Check all services health
for port in {5001..5007}; do
  echo "Checking service on port $port"
  curl -s http://localhost:$port/health
done
```

### Database Integration Testing

Verify database connections:

```bash
# Check MongoDB connection
docker exec -it future-earth-dev-mongodb-1 mongosh --eval "db.adminCommand('ping')"

# Check Redis connection
docker exec -it future-earth-dev-redis-1 redis-cli ping
```

## Development Workflow

1. **Local Development**:
   ```bash
   # Start dependencies only
   docker compose -p future-earth-dev up mongodb redis -d
   
   # Run service locally
   cd backend/services/ai-service
   npm run dev
   ```

2. **Hot Reload Development**:
   ```bash
   # Start everything with volume mounts
   docker compose -p future-earth-dev up --build -d
   ```

3. **Production Build Testing**:
   ```bash
   # Build and start with production configuration
   NODE_ENV=production docker compose -p future-earth-prod up --build -d
   ```

## Common Testing Commands

```bash
# Run all service tests
make test-all

# Run specific service tests
make test SERVICE=ai-service

# Run linting across all services
make lint-all

# Run integration tests
make test-integration
```

## Cleanup

```bash
# Stop and remove containers
docker compose -p future-earth-dev down

# Clean up volumes
docker compose -p future-earth-dev down -v

# Remove all related images
docker compose -p future-earth-dev down --rmi all
```

## Troubleshooting

1. **Service Dependencies**:
   - Check logs: `docker compose logs -f [service-name]`
   - Verify environment variables: `docker compose config`
   - Check network connectivity: `docker network inspect future-earth-dev_default`

2. **Common Issues**:
   - Port conflicts: Ensure no local services are using required ports
   - Database connection: Verify MongoDB/Redis credentials and connectivity
   - Build failures: Check for missing dependencies in package.json

3. **Debug Mode**:
   ```bash
   # Start with debug logging
   DEBUG=* docker compose up [service-name]
   ```

## CI/CD Testing

The repository includes GitHub Actions workflows for automated testing:

- Pull Request: `/.github/workflows/pr-test.yml`
- Integration: `/.github/workflows/integration-test.yml`
- Deployment: `/.github/workflows/deploy-test.yml`

Review these workflows for detailed testing procedures in the CI/CD pipeline.
