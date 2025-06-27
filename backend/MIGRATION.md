# Migration Guide

This document outlines the migration process from the AirCode backend to the Express + SQLite backend.

## Overview

The new backend provides:
- **Express.js** server instead of AirCode functions
- **SQLite** database instead of AirCode's MongoDB
- **Local file storage** instead of AirCode's file storage
- **Hybrid AI approach**: OpenAI for embeddings, xAI for chat completions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (for embeddings) |
| `XAI_API_KEY` | Yes | Your xAI API key (for chat completions) |

## Migration Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add your OpenAI and xAI API keys.

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## API Changes

The API endpoints remain the same, but the backend implementation has changed:

- `/ask` - Now uses OpenAI for embeddings and xAI's Grok model for responses
- `/upload` - Now stores data in SQLite instead of MongoDB
- `/generate` - Now uses OpenAI embeddings

## Data Migration

If you have existing data in AirCode, you'll need to re-upload your documents to the new backend since the data structures are different.

## Benefits

- **Self-hosted**: No dependency on AirCode
- **Cost-effective**: No AirCode usage fees
- **Customizable**: Full control over the backend
- **Scalable**: Can be deployed anywhere
- **Best of both worlds**: Reliable OpenAI embeddings + powerful xAI responses

## Migration Guide: From Aircode to Express + SQLite

This guide helps you migrate from the Aircode backend to the new Express + SQLite backend.

## What Changed

### Before (Aircode)
- **Deployment**: Cloud-based serverless functions on Aircode
- **Database**: Cloud database managed by Aircode
- **Storage**: Cloud storage for files
- **Scaling**: Automatic scaling by Aircode
- **Cost**: Pay-per-use cloud pricing

### After (Express + SQLite)
- **Deployment**: Self-hosted Express.js server
- **Database**: Local SQLite database
- **Storage**: Local filesystem storage
- **Scaling**: Manual scaling (can be deployed to any server)
- **Cost**: Only server hosting costs

## Migration Steps

### 1. Set Up New Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env and add your xAI API key
npm run init-db
npm start
```

### 2. Update Frontend Configuration

If you have a frontend configured to use the Aircode backend, update the backend URL:

**Before:**
```json
{
  "backend": "https://your-app.aircode.run/ask"
}
```

**After:**
```json
{
  "backend": "http://localhost:3000"
}
```

### 3. Data Migration (Optional)

If you have existing data in Aircode that you want to migrate:

1. **Export from Aircode**: Use Aircode's export functionality to get your data
2. **Transform Data**: Convert the exported data to match the new SQLite schema
3. **Import to SQLite**: Use the new backend's upload endpoints to re-upload your content

### 4. Update CLI Configuration

The CLI tools should work without changes, but update your `documate.json`:

```json
{
  "backend": "http://localhost:3000",
  "include": "**/*.md",
  "exclude": ["node_modules/**", "dist/**"]
}
```

## API Compatibility

The new backend maintains API compatibility with the Aircode version:

### Endpoints
- `POST /ask` - Ask questions (same format)
- `POST /upload` - Upload pages (same format)
- `GET /health` - Health check (new)

### Request/Response Format
All request and response formats remain the same, ensuring your existing frontend code continues to work.

## Deployment Options

### Local Development
```bash
npm run dev  # With hot reload
npm start    # Production mode
```

### Production Deployment

#### Option 1: VPS/Cloud Server
1. Upload code to your server
2. Install Node.js and npm
3. Set up environment variables
4. Use PM2 or similar process manager
5. Configure reverse proxy (nginx)

#### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run init-db
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option 3: Railway/Render/Heroku
Deploy as a standard Node.js application with environment variables.

## Database Management

### Backup
```bash
cp data/documate.db data/documate.db.backup
```

### Reset
```bash
rm data/documate.db
npm run init-db
```

### Migration Scripts
If you need to migrate data from other sources, you can create custom scripts using the `Database` class in `database.js`.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in .env
   PORT=3001
   ```

2. **Database locked**
   ```bash
   # Restart the server
   npm start
   ```

3. **xAI API errors**
   - Check your API key in `.env`
   - Verify your xAI account has credits

4. **CORS issues**
   - The server includes CORS middleware
   - If issues persist, check your frontend URL

### Logs
Check the console output for detailed error messages and debugging information.

## Performance Considerations

### SQLite Limitations
- **Concurrent writes**: SQLite has limitations on concurrent writes
- **File size**: Database file grows with content
- **Backup**: Regular backups recommended

### Scaling
For high-traffic scenarios, consider:
- Using PostgreSQL or MySQL instead of SQLite
- Implementing caching (Redis)
- Load balancing multiple instances

## Support

If you encounter issues during migration:
1. Check the logs for error messages
2. Verify your environment variables
3. Test with the included test script: `npm test`
4. Check the API endpoints with the health check: `GET /health` 