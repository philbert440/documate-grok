// @see https://docs.aircode.io/guide/functions/
const aircode = require('aircode');
const fetch = require('node-fetch');

const PagesTable = aircode.db.table('pages');

// xAI API configuration
const XAI_API_BASE = 'https://api.x.ai/v1';

// Helper function to create embeddings using xAI API
async function createEmbeddings(texts, apiKey) {
  const response = await fetch(`${XAI_API_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'embedding-001',
      input: texts.map(text => text.replace(/\n/g, ' ')),
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.map(item => item.embedding);
}

async function generateEmbeddings(project) {
  // Find all the pages without embeddings
  const pages = await PagesTable
    .where({ project, embedding: null })
    .find();

  if (!pages || pages.length === 0) {
    return { ok: 1 };
  }

  // Replace newlines with spaces for xAI embeddings
  const input = pages.map(page => page.content.replace(/\n/g, ' '));
  
  try {
    const apiKey = process.env.XAI_API_KEY;
  
    const embeddings = await createEmbeddings(input, apiKey);

    const updatedPage = pages.map((page, index) => ({
      _id: page._id,
      embedding: embeddings[index],
    }));

    for (let i = 0; i < updatedPage.length; i += 100) {
      await PagesTable.save(updatedPage.slice(i, i + 100));
    }
  
    return { ok: 1 };
  } catch (error) {
    console.error(`Failed to generate embeddings for ${project}`);
    throw error;
  }
}

module.exports = {
  generateEmbeddings,
} 