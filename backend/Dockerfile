# Use an official Node.js runtime as a parent image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Run TypeScript compilation if necessary
RUN npm run build

# ---

# Use a lighter runtime image for final build
FROM node:22-alpine

# Set working directory in the final image
WORKDIR /app

# Copy only the necessary files from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

# Expose the backend port
EXPOSE 5000

# Set environment variable for production
ENV NODE_ENV=production

# Run the backend service
CMD ["node", "dist/index.js"]
