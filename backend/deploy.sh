#!/bin/bash

# Philbot Backend Production Deployment Script
# This script helps set up the backend for production deployment with HTTPS

set -e

echo "🚀 Philbot Backend Production Deployment Script"
echo "================================================"

# Check if running as root (needed for some SSL operations)
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Running as root - this is fine for deployment"
else
   echo "ℹ️  Running as regular user"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    echo "   cp env.example .env"
    echo "   Then edit .env with your configuration"
    exit 1
fi

# Load environment variables
source .env

echo ""
echo "📋 Current Configuration:"
echo "   Port: ${PORT:-3000}"
echo "   Environment: ${NODE_ENV:-development}"
echo "   HTTPS Enabled: ${ENABLE_HTTPS:-false}"

if [ "${ENABLE_HTTPS}" = "true" ]; then
    echo "   SSL Certificate: ${SSL_CERT_PATH:-'Not set'}"
    echo "   SSL Private Key: ${SSL_KEY_PATH:-'Not set'}"
    
    # Check SSL certificate files
    if [ -n "$SSL_CERT_PATH" ] && [ -f "$SSL_CERT_PATH" ]; then
        echo "   ✅ SSL Certificate found"
    else
        echo "   ❌ SSL Certificate not found or not set"
    fi
    
    if [ -n "$SSL_KEY_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
        echo "   ✅ SSL Private Key found"
    else
        echo "   ❌ SSL Private Key not found or not set"
    fi
fi

echo ""
echo "🔧 Installing dependencies..."
npm install --production

echo ""
echo "🗄️  Initializing database..."
npm run init-db

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   npm run start:prod"
echo ""
echo "🔍 To check if it's running:"
echo "   curl http://localhost:${PORT:-3000}/health"
echo ""

# If HTTPS is enabled, show HTTPS health check
if [ "${ENABLE_HTTPS}" = "true" ]; then
    echo "🔒 For HTTPS health check:"
    echo "   curl -k https://localhost:${PORT:-3000}/health"
    echo ""
fi

echo "📝 For production deployment, consider:"
echo "   - Using a process manager like PM2"
echo "   - Setting up a reverse proxy (nginx/Apache)"
echo "   - Configuring firewall rules"
echo "   - Setting up log rotation"
echo "   - Using environment-specific .env files" 