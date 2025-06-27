require('dotenv').config();
const Database = require('./database');

async function debugEmbeddings() {
  const db = new Database();
  
  try {
    console.log('Checking database state...');
    
    // Check all pages for portfolio project
    const allPages = await db.all('SELECT id, project, path, title, embedding IS NULL as has_null_embedding FROM pages WHERE project = ?', ['portfolio']);
    console.log(`Total pages in portfolio project: ${allPages.length}`);
    
    // Check pages without embeddings
    const pagesWithoutEmbeddings = await db.getPagesWithoutEmbeddings('portfolio');
    console.log(`Pages without embeddings: ${pagesWithoutEmbeddings.length}`);
    
    // Test the getPagesByProject method
    console.log('\nTesting getPagesByProject method...');
    const pagesWithEmbeddings = await db.getPagesByProject('portfolio');
    console.log(`Pages returned by getPagesByProject: ${pagesWithEmbeddings.length}`);
    
    // Check how many have valid embeddings
    const validEmbeddings = pagesWithEmbeddings.filter(page => page.embedding && Array.isArray(page.embedding));
    console.log(`Pages with valid embeddings (array): ${validEmbeddings.length}`);
    
    // Check the first page's embedding
    if (pagesWithEmbeddings.length > 0) {
      const firstPage = pagesWithEmbeddings[0];
      console.log('\nFirst page embedding info:');
      console.log('- Path:', firstPage.path);
      console.log('- Embedding type:', typeof firstPage.embedding);
      console.log('- Embedding is null:', firstPage.embedding === null);
      console.log('- Embedding is array:', Array.isArray(firstPage.embedding));
      if (firstPage.embedding && Array.isArray(firstPage.embedding)) {
        console.log('- Embedding length:', firstPage.embedding.length);
      }
    }
    
    // Check if OPENAI_API_KEY is set
    console.log('\nOPENAI_API_KEY is set:', !!process.env.OPENAI_API_KEY);
    if (process.env.OPENAI_API_KEY) {
      console.log('OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    }
    
  } catch (error) {
    console.error('Error debugging embeddings:', error);
  } finally {
    await db.close();
  }
}

debugEmbeddings(); 