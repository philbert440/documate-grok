const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const tokenizer = require('gpt-3-encoder');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'documate.db');
const db = new sqlite3.Database(dbPath);

const MAX_TOKEN_PER_CHUNK = 8191;

// Split the page content into chunks based on the MAX_TOKEN_PER_CHUNK
function getContentChunks(content) {
  const encoded = tokenizer.encode(content);
  const tokenChunks = encoded.reduce(
    (acc, token) => (
      acc[acc.length - 1].length < MAX_TOKEN_PER_CHUNK
        ? acc[acc.length - 1].push(token)
        : acc.push([token]),
      acc
    ),
    [[]],
  );
  return tokenChunks.map(tokens => tokenizer.decode(tokens));
}

// Extract title from markdown content (first # heading or filename)
function extractTitle(content, filename) {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  // Fallback to filename without extension
  return path.basename(filename, '.md');
}

// Process markdown files from portfolio/vitepress
function processMarkdownFiles() {
  return new Promise((resolve, reject) => {
    const portfolioDir = path.join(__dirname, '..', 'portfolio', 'vitepress');

    if (!fs.existsSync(portfolioDir)) {
      console.log('Portfolio directory not found, skipping markdown processing');
      resolve();
      return;
    }

    const files = fs.readdirSync(portfolioDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');

    console.log(`Found ${markdownFiles.length} markdown files to process`);

    let processedCount = 0;
    const totalFiles = markdownFiles.length;

    if (totalFiles === 0) {
      resolve();
      return;
    }

    for (const file of markdownFiles) {
      const filePath = path.join(portfolioDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Skip files with only frontmatter (like index.md)
      const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\s*/, '').trim();
      if (!contentWithoutFrontmatter) {
        console.log(`Skipping ${file} - no content after frontmatter`);
        processedCount++;
        if (processedCount === totalFiles) {
          resolve();
        }
        continue;
      }

      const title = extractTitle(content, file);
      const checksum = crypto.createHash('md5').update(content).digest('hex');
      const chunks = getContentChunks(content);

      console.log(`Processing ${file} - ${chunks.length} chunks`);

      let chunkIndex = 0;
      const totalChunks = chunks.length;

      const processChunk = () => {
        if (chunkIndex >= totalChunks) {
          processedCount++;
          if (processedCount === totalFiles) {
            console.log('Markdown files processing completed');
            resolve();
          }
          return;
        }

        const chunk = chunks[chunkIndex];
        const sql = `
          INSERT OR REPLACE INTO pages
          (project, path, title, content, checksum, chunk_index, embedding, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.run(sql, ['default', file, title, chunk, checksum, chunkIndex, null], function(err) {
          if (err) {
            console.error(`Error saving chunk ${chunkIndex} of ${file}:`, err);
            reject(err);
            return;
          }
          chunkIndex++;
          processChunk();
        });
      };

      processChunk();
    }
  });
}

// Create pages table
const createPagesTable = `
  CREATE TABLE IF NOT EXISTS pages (
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
  )
`;

// Create index for better performance
const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project);
  CREATE INDEX IF NOT EXISTS idx_pages_path ON pages(path);
  CREATE INDEX IF NOT EXISTS idx_pages_embedding ON pages(embedding);
`;

async function initializeDatabase() {
  console.log('Initializing database...');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(createPagesTable, (err) => {
        if (err) {
          console.error('Error creating pages table:', err);
          reject(err);
          return;
        }
        console.log('Pages table created successfully');
      });

      db.run(createIndexes, (err) => {
        if (err) {
          console.error('Error creating indexes:', err);
          reject(err);
          return;
        }
        console.log('Indexes created successfully');
      });

      // Process markdown files after table creation
      processMarkdownFiles()
        .then(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
              reject(err);
            } else {
              console.log('Database initialized successfully at:', dbPath);
              resolve();
            }
          });
        })
        .catch(reject);
    });
  });
}

// Run the initialization
initializeDatabase().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});