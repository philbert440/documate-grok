require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const handleAsk = require('./ask');
const handleUpload = require('./upload');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dataDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ask endpoint - handles questions and returns streaming responses
app.post('/ask', async (req, res) => {
  try {
    const stream = await handleAsk(req.body);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Pipe the stream to response
    stream.pipe(res);

    // Handle stream errors
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error occurred' });
      }
    });

  } catch (error) {
    console.error('Ask endpoint error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate answer'
    });
  }
});

// Upload endpoint - handles page uploads and operations
app.post('/upload', async (req, res) => {
  try {
    const result = await handleUpload(req.body);
    res.json(result);
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process upload'
    });
  }
});

// File upload endpoint (if needed for future use)
app.post('/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Function to create and start the server
function startServer() {
  const enableHttps = process.env.ENABLE_HTTPS === 'true';

  if (enableHttps) {
    // HTTPS Server
    const sslCertPath = process.env.SSL_CERT_PATH;
    const sslKeyPath = process.env.SSL_KEY_PATH;

    if (!sslCertPath || !sslKeyPath) {
      console.error('HTTPS is enabled but SSL certificate paths are not configured.');
      console.error('Please set SSL_CERT_PATH and SSL_KEY_PATH environment variables.');
      process.exit(1);
    }

    // Check if certificate files exist
    if (!fs.existsSync(sslCertPath) || !fs.existsSync(sslKeyPath)) {
      console.error('SSL certificate files not found:');
      console.error(`Certificate: ${sslCertPath}`);
      console.error(`Private key: ${sslKeyPath}`);
      process.exit(1);
    }

    const httpsOptions = {
      cert: fs.readFileSync(sslCertPath),
      key: fs.readFileSync(sslKeyPath)
    };

    const httpsServer = https.createServer(httpsOptions, app);

    // Set timeout to 5 minutes for long responses
    httpsServer.timeout = 300000; // 5 minutes in milliseconds

    httpsServer.listen(PORT, () => {
      console.log(`🚀 Philbot backend server running on HTTPS port ${PORT}`);
      console.log(`🔒 Health check: https://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
    });

    return httpsServer;
  } else {
    // HTTP Server
    const httpServer = http.createServer(app);

    // Set timeout to 5 minutes for long responses
    httpServer.timeout = 300000; // 5 minutes in milliseconds

    httpServer.listen(PORT, () => {
      console.log(`🚀 Philbot backend server running on HTTP port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
    });

    return httpServer;
  }
}

// Start server
const server = startServer();

module.exports = app;