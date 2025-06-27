const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'documate.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all("SELECT COUNT(*) as count FROM pages WHERE project='portfolio'", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Portfolio pages count:', rows[0].count);
  }
  
  db.all("SELECT id, path, embedding IS NULL as is_null FROM pages WHERE project='portfolio' LIMIT 3", (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Sample pages:');
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, Path: ${row.path}, Embedding NULL: ${row.is_null}`);
      });
    }
    
    db.close();
  });
}); 