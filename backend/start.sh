#!/bin/bash

echo "🚀 Setting up Documate Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env and add your OpenAI API key!"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize database
echo "🗄️  Initializing database..."
npm run init-db

# Start the server
echo "🌐 Starting server..."
echo "   Server will be available at: http://localhost:3000"
echo "   Health check: http://localhost:3000/health"
echo ""
npm start 