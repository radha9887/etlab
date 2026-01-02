#!/bin/bash
set -e

echo "Starting ETLab..."

# Create data directory if it doesn't exist
mkdir -p /data

# Start Nginx in background
echo "Starting Nginx..."
nginx

# Start FastAPI backend
echo "Starting FastAPI backend..."
cd /app/backend
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
