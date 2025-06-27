# Documate Backend

A backend service for Documate that provides document search and question-answering capabilities using Express, SQLite, OpenAI embeddings, and xAI chat completions.

## Features

- Document upload and storage
- Vector search using OpenAI embeddings
- Question answering using xAI's Grok model
- SQLite database for data persistence
- RESTful API endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Set your API keys in the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
XAI_API_KEY=your_xai_api_key_here
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the server:
```bash
npm start
```

## API Endpoints

- `POST /ask` - Ask questions about your documentation
- `POST /upload` - Upload and process documents
- `POST /generate` - Generate embeddings for existing documents

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (for embeddings) |
| `XAI_API_KEY` | Yes | Your xAI API key (for chat completions) |
| `PORT` | No | Server port (default: 3000) |

## How it works

This backend uses a hybrid approach:
- **OpenAI embeddings**: For creating vector representations of documents and questions (cost-effective and reliable)
- **xAI Grok model**: For generating chat responses (powerful AI model)

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

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
