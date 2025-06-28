#!/bin/bash

# Philbot Frontend Production Deployment Script
# This script helps set up the frontend for production deployment with HTTPS

set -e

echo "🚀 Philbot Frontend Production Deployment Script"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ℹ️  .env file not found. Creating from example..."
    cp env.example .env
    echo "   Please edit .env with your production settings"
fi

# Load environment variables
if [ -f .env ]; then
    source .env
fi

echo ""
echo "📋 Current Configuration:"
echo "   Backend URL: ${BACKEND_URL:-'http://localhost:3000'}"
echo "   Node Environment: ${NODE_ENV:-'development'}"
echo "   Build Environment: ${BUILD_ENV:-'development'}"

# Check if backend URL is HTTPS
if [[ "${BACKEND_URL}" == https://* ]]; then
    echo "   ✅ Backend URL is HTTPS"
else
    echo "   ⚠️  Backend URL is not HTTPS"
    echo "   💡 Set BACKEND_URL=https://yourdomain.com in .env for production"
fi

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "📦 Building configuration..."
npm run config:build

echo ""
echo "🏗️  Building for production..."
npm run docs:build:prod

echo ""
echo "✅ Frontend deployment setup complete!"
echo ""
echo "📁 Build output: .vitepress/dist/"
echo ""
echo "🚀 To deploy:"
echo "   - Copy .vitepress/dist/ to your web server"
echo "   - Configure your web server for HTTPS"
echo "   - Ensure your backend is running with HTTPS"
echo ""
echo "🔍 To test locally:"
echo "   npm run docs:preview"
echo ""
echo "📝 For production deployment, consider:"
echo "   - Using a CDN for static assets"
echo "   - Setting up proper caching headers"
echo "   - Configuring your web server (nginx/Apache)"
echo "   - Setting up SSL certificates"
echo "   - Configuring domain and DNS" 