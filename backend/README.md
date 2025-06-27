# Documate Backend

A Node.js backend for Documate using Express, SQLite, and filesystem storage.

## Features

- **Express.js** - Fast, unopinionated web framework
- **SQLite** - Lightweight, serverless database
- **Filesystem Storage** - Local file storage for uploads
- **OpenAI Integration** - AI-powered question answering
- **Vector Search** - Semantic search using embeddings
- **Streaming Responses** - Real-time AI responses

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Ask Questions
- `POST /ask` - Ask questions and get AI-powered answers
  ```json
  {
    "question": "How do I install the package?",
    "project": "default"
  }
  ```

### Upload Pages
- `POST /upload` - Upload and manage documentation pages
  ```json
  {
    "operation": "add",
    "project": "default",
    "path": "/getting-started",
    "title": "Getting Started",
    "content": "# Getting Started\n\nWelcome to our documentation..."
  }
  ```

### Operations
- `add` - Add or update a page
- `delete` - Delete a specific page
- `clean` - Delete all pages for a project
- `generate` - Generate embeddings for pages without them

### File Upload
- `POST /upload-file` - Upload files (multipart/form-data)

## Database Schema

The SQLite database contains a `pages` table with the following structure:

```sql
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project TEXT NOT NULL DEFAULT 'default',
  path TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  checksum TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  embedding TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project, path, chunk_index)
);
```

## File Structure

```
backend/
├── data/                 # SQLite database and uploaded files
├── database.js          # Database utility class
├── server.js            # Express server
├── ask.js              # Question handling logic
├── upload.js           # Page upload logic
├── generate.js         # Embedding generation
├── init-db.js          # Database initialization
├── package.json        # Dependencies
└── env.example         # Environment variables template
```

## Development

- **Hot reload:** `npm run dev` (uses nodemon)
- **Database reset:** Delete `data/documate.db` and run `npm run init-db`
- **Logs:** Check console output for detailed logging

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure your reverse proxy (nginx, etc.)
3. Use a process manager like PM2
4. Set up proper environment variables
5. Consider using a more robust database for high-traffic scenarios

## Migration from Aircode

This backend replaces the Aircode implementation with:
- Local SQLite database instead of cloud database
- Express.js server instead of serverless functions
- Filesystem storage instead of cloud storage
- Same API endpoints for compatibility
