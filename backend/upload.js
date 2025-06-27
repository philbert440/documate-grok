const crypto = require('crypto');
const tokenizer = require('gpt-3-encoder');
const { generateEmbeddings } = require('./generate');
const Database = require('./database');

const MAX_TOKEN_PER_CHUNK = 8191;

// Split the page content into chunks base on the MAX_TOKEN_PER_CHUNK
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

async function handleUpload(params) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing environment variable OPENAI_API_KEY');
  }

  const { operation, project = 'default' } = params;

  if (!['add', 'delete', 'clean', 'generate'].includes(operation)) {
    throw new Error(`Operation ${operation} is not supported`);
  }

  const db = new Database();

  try {
    if (operation === 'clean') {
      // Delete all the stored pages
      await db.deletePagesByProject(project);
      return { ok: 1 };
    }

    if (operation === 'generate') {
      await generateEmbeddings(project);
      return { ok: 1 };
    }

    const { path, title = '', content = '' } = params;

    if (!path) {
      throw new Error('Missing param `path`');
    }

    console.log(`${operation} page with path ${path}`);

    if (operation === 'delete') {
      // Delete single page
      await db.deletePageByPath(project, path);
      return { ok: 1 };
    }

    // Generate checksum for the page, so we can determine if this page is changed
    const checksum = crypto.createHash('md5').update(content).digest('hex');
    const existed = await db.getPageByPath(project, path);

    if (existed && existed.length > 0) {
      const firstPage = existed[0];
      if (firstPage.checksum === checksum) {
        console.log('This page\'s content is still fresh. Skip regenerating.');
        return { ok: 1 };
      } else {
        // Delete the exist one since we will regenerate it
        await db.deletePageByPath(project, path);
      }
    }

    const chunks = getContentChunks(content);
    const pagesToSave = chunks.map((chunk, index) => ({
      project,
      path,
      title,
      checksum,
      chunkIndex: index,
      content: chunk,
      embedding: null,
    }));

    // Save the result to database
    for (const page of pagesToSave) {
      await db.savePage(page);
    }

    return { ok: 1 };
  } finally {
    await db.close();
  }
}

module.exports = handleUpload;
