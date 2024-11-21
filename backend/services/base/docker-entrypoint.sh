#!/bin/sh
set -e

# Function to wait for dependent services
wait_for_service() {
    host="$1"
    port="$2"
    timeout="$3"
    
    echo "Waiting for $host:$port..."
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port"; then
            return 0
        fi
        sleep 1
    done
    return 1
}

# Check if we need to wait for dependencies
if [ -n "$WAIT_FOR_SERVICES" ]; then
    echo "Checking service dependencies..."
    
    IFS=',' read -ra SERVICES <<< "$WAIT_FOR_SERVICES"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -ra HOSTPORT <<< "$service"
        if ! wait_for_service "${HOSTPORT[0]}" "${HOSTPORT[1]}" 30; then
            echo "Service ${HOSTPORT[0]}:${HOSTPORT[1]} not available"
            exit 1
        fi
    done
fi

# Apply environment-specific configurations
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode"
    exec npm run dev
else
    echo "Running in production mode"
    exec "$@"
fi