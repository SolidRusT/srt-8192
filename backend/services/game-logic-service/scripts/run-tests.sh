#!/bin/bash

# Ensure script exits on any error
set -e

# Start test containers
echo "Starting test environment..."
docker-compose -f docker-compose.test.yml up -d test-mongodb test-redis

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until docker-compose -f docker-compose.test.yml exec test-mongodb mongo --eval "print('MongoDB is ready')" > /dev/null 2>&1; do
  sleep 1
done

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
until docker-compose -f docker-compose.test.yml exec test-redis redis-cli ping > /dev/null 2>&1; do
  sleep 1
done

# Run tests
echo "Running tests..."
docker-compose -f docker-compose.test.yml run --rm game-logic-tests

# Clean up
echo "Cleaning up test environment..."
docker-compose -f docker-compose.test.yml down

echo "Test run complete!"