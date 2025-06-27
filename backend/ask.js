const OpenAI = require('openai');
const { create, insertMultiple, searchVector } = require('@orama/orama');
const tokenizer = require('gpt-3-encoder');
const { OpenAIStream } = require('ai');
const Database = require('./database');

const MAX_CONTEXT_TOKEN = 1500;

async function handleAsk(params) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing environment variable OPENAI_API_KEY');
  }

  if (!params.question) {
    throw new Error('Missing param `question`');
  }

  const db = new Database();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Moderate the content
    const question = params.question.trim();
    const { results: moderationRes } = await openai.moderations.create({
      input: question,
    });
    if (moderationRes[0].flagged) {
      console.log('The user input contains flagged content.', moderationRes[0].categories);
      throw new Error('Question input didn\'t meet the moderation criteria.');
    }

    // Create embedding from the question
    const { data: [ { embedding }] } = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question.replace(/\n/g, ' '),
    });
    
    // Get all pages
    const { project = 'default' } = params;
    const pages = await db.getPagesByProject(project);

    // Search vectors to generate context
    const memDB = await create({
      schema: {
        path: 'string',
        title: 'string',
        content: 'string',
        embedding: 'vector[1536]',
      },
    });
    await insertMultiple(memDB, pages);

    const { hits } = await searchVector(memDB, {
      vector: embedding,
      property: 'embedding',
      similarity: 0.8,  // Minimum similarity. Defaults to `0.8`
      limit: 10,        // Defaults to `10`
      offset: 0,        // Defaults to `0`
    });

    let tokenCount = 0;
    let contextSections = '';

    for (let i = 0; i < hits.length; i += 1) {
      const { content } = hits[i].document;
      const encoded = tokenizer.encode(content);
      tokenCount += encoded.length;

      if (tokenCount >= MAX_CONTEXT_TOKEN && contextSections !== '') {
        break;
      }

      contextSections += `${content.trim()}\n---\n`;
    }

    // Ask gpt
    const prompt = `You are a very kindly assistant who loves to help people. Given the following sections from documatation, answer the question using only that information, outputted in markdown format. If you are unsure and the answer is not explicitly written in the documentation, say "Sorry, I don't know how to help with that." Always trying to anwser in the spoken language of the questioner.

Context sections:
${contextSections}

Question:
${question}

Answer as markdown (including related code snippets if available):`

    const messages = [{
      role: 'user',
      content: prompt,
    }];

    const response = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 512,
      temperature: 0.4,
      stream: true,
    });

    // Transform the response into a readable stream
    const stream = OpenAIStream(response);
    return stream;
  } catch (error) {
    console.error('Error in ask handler:', error);
    throw error;
  } finally {
    await db.close();
  }
}

module.exports = handleAsk;
