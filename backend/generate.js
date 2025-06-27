const OpenAI = require('openai');
const Database = require('./database');

async function generateEmbeddings(project) {
  const db = new Database();
  
  try {
    // Find all the pages without embeddings
    const pages = await db.getPagesWithoutEmbeddings(project);

    if (!pages || pages.length === 0) {
      console.log('No pages without embeddings found');
      return { ok: 1 };
    }

    console.log(`Generating embeddings for ${pages.length} pages`);

    // Replace newlines with spaces for OpenAI embeddings
    const input = pages.map(page => page.content.replace(/\n/g, ' '));
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const { data, usage } = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });

    // Update pages with embeddings
    for (let i = 0; i < pages.length; i++) {
      await db.updatePageEmbedding(pages[i].id, data[i].embedding);
    }

    console.log(`Successfully generated embeddings for ${pages.length} pages`);
    return { ok: 1 };
  } catch (error) {
    console.error(`Failed to generate embeddings for ${project}:`, error);
    throw error;
  } finally {
    await db.close();
  }
}

module.exports = {
  generateEmbeddings,
}
