# ============================================================================
# ECOSYSTEM OASIS - Production Dockerfile
# ============================================================================
# Multi-stage build for optimal image size and security
# Resolves Error 413 (Request Entity Too Large) with Nginx + Express config
# Stack: NestJS (Backend) + React (Frontend) + Node.js 18-alpine
# ============================================================================

# Stage 1: Build Backend (NestJS)
# ============================================================================
FROM node:18-alpine AS builder-backend

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production && npm ci

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Build backend
RUN npm run build

# ============================================================================
# Stage 2: Build Frontend (React + Vite)
# ============================================================================
FROM node:18-alpine AS builder-frontend

WORKDIR /app

# Copy frontend dependencies
COPY frontend/package*.json ./frontend/
COPY frontend/vite.config.js ./frontend/
COPY frontend/index.html ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/tailwind.config.js ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/scripts ./scripts

# Build frontend
RUN npm run build

# ============================================================================
# Stage 3: Production Runtime
# ============================================================================
FROM node:18-alpine

WORKDIR /app

# Install essential system packages
RUN apk add --no-cache \
    dumb-init \
    bash \
    curl \
    nginx \
    && rm -rf /var/cache/apk/*

# Copy built backend from stage 1
COPY --from=builder-backend /app/backend/dist ./backend/dist
COPY --from=builder-backend /app/backend/node_modules ./backend/node_modules
COPY --from=builder-backend /app/backend/package.json ./backend/

# Copy built frontend from stage 2
COPY --from=builder-frontend /app/frontend/dist ./frontend/dist
COPY --from=builder-frontend /app/frontend/package.json ./frontend/

# Copy environment files and configs
COPY backend/.env* ./backend/ 2>/dev/null || true
COPY .env* ./ 2>/dev/null || true

# ============================================================================
# ⚠️ CRITICAL CONFIG - Nginx + Express Payload Limits
# ============================================================================

# Create Nginx configuration directory
RUN mkdir -p /etc/nginx/conf.d /etc/nginx/sites-available /etc/nginx/sites-enabled

# Configure Nginx to allow large uploads (20MB client body size)
# This fixes Error 413 (Request Entity Too Large)
RUN cat > /etc/nginx/conf.d/00-client-body-size.conf <<'EOF'
# Allow up to 20MB uploads to prevent Error 413
client_max_body_size 20m;

# Improve performance
client_body_buffer_size 10m;
EOF

# Configure Nginx for reverse proxy to Node.js backend
RUN cat > /etc/nginx/conf.d/01-upstream.conf <<'EOF'
upstream backend {
    server localhost:3000;
    keepalive 32;
}
EOF

# Configure Nginx virtual host
RUN cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80;
    server_name _;
    
    # Timeouts for slow uploads/downloads
    proxy_connect_timeout 180s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Serve static frontend files (dist)
    location / {
        alias /app/frontend/dist/;
        try_files $uri $uri/ /index.html;
        
        # Cache busting headers
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Serve uploaded files
    location /uploads {
        alias /app/backend/uploads;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
    
    # Proxy API requests to Node.js backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        # Critical headers for large uploads
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Forward original request info
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (for future real-time features)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable Nginx site
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Verify Nginx configuration
RUN nginx -t

# ============================================================================
# Health Check
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# ============================================================================
# Expose Ports
# ============================================================================

EXPOSE 80 3000

# ============================================================================
# Environment Configuration
# ============================================================================

# Default environment (can be overridden by Railway)
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    PORT=3000

# ============================================================================
# Startup Script
# ============================================================================

# Create startup script that runs both Nginx and Node.js
RUN cat > /app/start.sh <<'EOF'
#!/bin/bash
set -e

echo "🚀 Starting Ecosystem Oasis..."

# Start Nginx in background
echo "📡 Starting Nginx..."
nginx -g "daemon off;" &

# Start Node.js backend
echo "⚙️ Starting NestJS backend..."
cd /app/backend
exec node dist/main

EOF

RUN chmod +x /app/start.sh

# ============================================================================
# Entry Point
# ============================================================================

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/start.sh"]

# ============================================================================
# Build Metadata
# ============================================================================

LABEL maintainer="Ecosystem Oasis Team"
LABEL description="Production Docker image for Ecosystem Oasis platform"
LABEL version="1.0"
