const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'documate.db');
const db = new sqlite3.Database(dbPath);

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

db.serialize(() => {
  console.log('Initializing database...');
  
  db.run(createPagesTable, (err) => {
    if (err) {
      console.error('Error creating pages table:', err);
    } else {
      console.log('Pages table created successfully');
    }
  });

  db.run(createIndexes, (err) => {
    if (err) {
      console.error('Error creating indexes:', err);
    } else {
      console.log('Indexes created successfully');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialized successfully at:', dbPath);
  }
}); 