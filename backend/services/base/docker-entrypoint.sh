#!/bin/bash
set -e

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if required environment variables are set
check_required_env() {
    local missing=()
    for var in "$@"; do
        if [[ -z "${!var}" ]]; then
            missing+=("$var")
        fi
    done
    
    if [[ ${#missing[@]} -ne 0 ]]; then
        log "ERROR: Missing required environment variables: ${missing[*]}"
        exit 1
    fi
}

# Function to wait for dependent services
wait_for_service() {
    local host="$1"
    local port="$2"
    local service_name="$3"
    local retries=30
    local wait_time=2
    
    log "Waiting for $service_name at $host:$port..."
    
    while ! nc -z "$host" "$port" > /dev/null 2>&1; do
        retries=$((retries - 1))
        if [[ $retries -eq 0 ]]; then
            log "ERROR: Failed to connect to $service_name at $host:$port"
            exit 1
        fi
        log "Waiting for $service_name to be ready... ($retries attempts remaining)"
        sleep "$wait_time"
    done
    
    log "$service_name is ready at $host:$port"
}

# Load appropriate environment file based on NODE_ENV
if [[ -z "$NODE_ENV" ]]; then
    export NODE_ENV="development"
fi

ENV_FILE=".env.${NODE_ENV}"
if [[ -f "$ENV_FILE" ]]; then
    log "Loading environment from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    log "Warning: $ENV_FILE not found, using existing environment variables"
fi

# Check required environment variables
check_required_env "SERVICE_NAME" "PORT" "NODE_ENV"

# Parse and wait for dependent services
if [[ -n "$WAIT_FOR_SERVICES" ]]; then
    IFS=',' read -ra SERVICES <<< "$WAIT_FOR_SERVICES"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -ra HOSTPORT <<< "$service"
        wait_for_service "${HOSTPORT[0]}" "${HOSTPORT[1]}" "$service"
    done
fi

# Set resource limits if specified
if [[ -n "$MEMORY_LIMIT" ]]; then
    log "Setting memory limit to $MEMORY_LIMIT"
    # Implementation depends on container runtime and platform
fi

if [[ -n "$CPU_LIMIT" ]]; then
    log "Setting CPU limit to $CPU_LIMIT"
    # Implementation depends on container runtime and platform
fi

# Start the application with the appropriate command based on environment
if [[ "$NODE_ENV" == "development" && "$ENABLE_HOT_RELOAD" == "true" ]]; then
    log "Starting service in development mode with hot reload..."
    exec yarn dev
else
    log "Starting service in $NODE_ENV mode..."
    exec yarn start
fi