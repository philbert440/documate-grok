const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'data', 'documate.db');
    this.db = new sqlite3.Database(dbPath);
  }

  // Promise wrapper for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Page operations
  async getPagesByProject(project) {
    const sql = `
      SELECT path, title, content, embedding 
      FROM pages 
      WHERE project = ? 
      ORDER BY path, chunk_index
    `;
    const rows = await this.all(sql, [project]);
    
    // Parse embeddings back to arrays
    return rows.map(row => ({
      ...row,
      embedding: row.embedding ? JSON.parse(row.embedding) : null
    }));
  }

  async getPageByPath(project, path) {
    const sql = `
      SELECT * FROM pages 
      WHERE project = ? AND path = ?
      ORDER BY chunk_index
    `;
    return await this.all(sql, [project, path]);
  }

  async deletePagesByProject(project) {
    const sql = 'DELETE FROM pages WHERE project = ?';
    return await this.run(sql, [project]);
  }

  async deletePageByPath(project, path) {
    const sql = 'DELETE FROM pages WHERE project = ? AND path = ?';
    return await this.run(sql, [project, path]);
  }

  async savePage(pageData) {
    const sql = `
      INSERT OR REPLACE INTO pages 
      (project, path, title, content, checksum, chunk_index, embedding, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const embedding = pageData.embedding ? JSON.stringify(pageData.embedding) : null;
    
    return await this.run(sql, [
      pageData.project,
      pageData.path,
      pageData.title,
      pageData.content,
      pageData.checksum,
      pageData.chunkIndex,
      embedding
    ]);
  }

  async getPagesWithoutEmbeddings(project) {
    const sql = `
      SELECT * FROM pages 
      WHERE project = ? AND embedding IS NULL
      ORDER BY path, chunk_index
    `;
    return await this.all(sql, [project]);
  }

  async updatePageEmbedding(id, embedding) {
    const sql = `
      UPDATE pages 
      SET embedding = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return await this.run(sql, [JSON.stringify(embedding), id]);
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Database; 