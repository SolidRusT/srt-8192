# Use an official Node.js runtime as a parent image for building the app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# ---

# Use a lighter runtime image for serving the build output
FROM nginx:alpine

# Copy build output to the nginx container
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
