# Extend from our base service image
FROM srt-8192/base-service

# AI Service specific configurations
ENV SERVICE_NAME=ai-service \
    SERVICE_PORT=5002 \
    WAIT_FOR_SERVICES=mongodb:27017

# Copy service-specific package.json
COPY package*.json ./

# Install any additional dependencies specific to AI service
RUN npm ci --production

# Service-specific health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:${SERVICE_PORT}/health || exit 1

EXPOSE ${SERVICE_PORT}