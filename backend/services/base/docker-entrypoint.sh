#!/bin/sh
set -e

# Update the HEALTHCHECK command port if PORT env var is set
if [ ! -z "$PORT" ]; then
    sed -i "s/8080/$PORT/g" /app/Dockerfile
fi

# Execute the main container command
exec "$@"