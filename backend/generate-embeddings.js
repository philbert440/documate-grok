require('dotenv').config();
const { generateEmbeddings } = require('./generate');

async function main() {
  try {
    console.log('Generating embeddings for portfolio project...');
    await generateEmbeddings('portfolio');
    console.log('Embeddings generation completed successfully!');
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

main(); 