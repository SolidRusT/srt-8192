# Extend from base service image
FROM suparious/srt-8192-base:latest

# Service-specific environment variables
ENV SERVICE_NAME=api-gateway \
    PORT=5002

# Copy service-specific files
COPY . .

# Build and run are handled by base image