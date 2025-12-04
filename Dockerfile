# Multi-stage build for Rocket.Chat
FROM node:22.16.0-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:22.16.0-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates

# Create app user
RUN addgroup -g 1001 -S rocketchat && \
    adduser -S -u 1001 -G rocketchat rocketchat

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=rocketchat:rocketchat /app ./

# Switch to non-root user
USER rocketchat

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/info || exit 1

# Start the application
CMD ["node", "apps/meteor/.meteor/local/build/main.js"]
