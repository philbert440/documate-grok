# VitePress + Documate Setup

This example shows how to integrate Documate with VitePress for AI-powered documentation search.

## Prerequisites

1. Node.js installed
2. OpenAI API key (for embeddings)
3. xAI API key (for chat completions)

## Setup Steps

1. **Start the backend server:**
   ```bash
   cd ../../backend
   npm install
   cp env.example .env
   # Edit .env and add your API keys:
   # OPENAI_API_KEY=your_openai_api_key_here
   # XAI_API_KEY=your_xai_api_key_here
   npm run init-db
   npm start
   ```

2. **In a new terminal, start the VitePress dev server:**
   ```bash
   cd examples/vitepress
   npm install
   npm run dev
   ```

3. **Upload your documentation:**
   ```bash
   npx documate upload
   ```

4. **Open your browser:**
   - VitePress site: http://localhost:5173
   - Backend API: http://localhost:3000

## How it works

- The backend uses OpenAI for creating embeddings (vector representations) of your documentation
- When users ask questions, the system finds relevant content using vector search
- xAI's Grok model generates the final response based on the relevant documentation

## Configuration

The `documate.json` file configures:
- `root`: The root directory for documentation
- `include`: File patterns to include (markdown files)
- `backend`: The backend server URL

## Customization

You can customize the Documate component in your VitePress theme or add it to individual pages as needed. 