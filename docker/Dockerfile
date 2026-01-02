# ETLab - Multi-stage Dockerfile
# Builds both frontend and backend into a single image

# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Production Image
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Java for Spark
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    procps \
    default-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME for Spark (OpenJDK 21 on Debian Trixie)
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Copy Python requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy Docker configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/start.sh /start.sh

# Create data directory and airflow dags directory
RUN mkdir -p /data /app/airflow/dags

# Make start script executable
RUN chmod +x /start.sh

# Environment defaults
ENV DATABASE_URL=sqlite+aiosqlite:///./data/etlab.db
ENV SPARK_MASTER=local[*]
ENV HOST=0.0.0.0
ENV PORT=8000

# Expose ports
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

# Start application
CMD ["/start.sh"]
