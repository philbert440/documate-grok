const OpenAI = require('openai');
const fetch = require('node-fetch');
const { create, insertMultiple, searchVector } = require('@orama/orama');
const tokenizer = require('gpt-3-encoder');
const Database = require('./database');

const MAX_CONTEXT_TOKEN = 1500;

// xAI API configuration
const XAI_API_BASE = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-3-mini';

// Helper function to create chat completion using xAI API
async function createChatCompletion(messages, apiKey) {
  console.log('createChatCompletion: Starting API call to xAI...');
  const response = await fetch(`${XAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      reasoning_effort: "low",
      messages,
      max_tokens: 512,
      temperature: 0.4,
      stream: false, // Try non-streaming first
    }),
  });

  console.log('createChatCompletion: Got response from xAI API');
  console.log('createChatCompletion: Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('xAI Chat API Error Response:', errorText);
    throw new Error(`xAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('createChatCompletion: Full response:', JSON.stringify(responseData, null, 2));

  if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
    const message = responseData.choices[0].message;

    let content = message.content;

    if (!content) {
      content = 'Sorry, I couldn\'t generate a response at this time.';
    }

    console.log('createChatCompletion: Extracted content:', content);

    // Create a readable stream from the content
    const { Readable } = require('stream');
    return Readable.from([content]);
  } else {
    throw new Error('No content found in xAI response');
  }
}

async function handleAsk(params) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing environment variable OPENAI_API_KEY');
  }

  if (!process.env.XAI_API_KEY) {
    throw new Error('Missing environment variable XAI_API_KEY');
  }

  if (!params.question) {
    throw new Error('Missing param `question`');
  }

  const db = new Database();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const xaiApiKey = process.env.XAI_API_KEY;

    // Moderate the content
    const question = params.question.trim();
    console.log('Question received:', question);

    const { results: moderationRes } = await openai.moderations.create({
      input: question,
    });
    if (moderationRes[0].flagged) {
      console.log('The user input contains flagged content.', moderationRes[0].categories);
      throw new Error('Question input didn\'t meet the moderation criteria.');
    }

    // Create embedding from the question using OpenAI
    const { data: [ { embedding }] } = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: question.replace(/\n/g, ' '),
    });

    // Get all pages
    const { project = 'portfolio' } = params;
    const pages = await db.getPagesByProject(project);
    console.log(`Found ${pages.length} pages in database for project: ${project}`);

    if (pages.length === 0) {
      console.log('No pages found in database. Make sure to upload documentation first.');
      throw new Error('No documentation found. Please upload some documentation first.');
    }

    // Filter out pages without embeddings
    const pagesWithEmbeddings = pages.filter(page => page.embedding && Array.isArray(page.embedding));
    console.log(`Found ${pagesWithEmbeddings.length} pages with embeddings out of ${pages.length} total pages`);

    if (pagesWithEmbeddings.length === 0) {
      console.log('No pages with embeddings found. Please generate embeddings first.');
      throw new Error('No pages with embeddings found. Please generate embeddings first.');
    }

    // Search vectors to generate context
    const memDB = await create({
      schema: {
        path: 'string',
        title: 'string',
        content: 'string',
        embedding: 'vector[1536]',
      },
    });
    await insertMultiple(memDB, pagesWithEmbeddings);

    const { hits } = await searchVector(memDB, {
      vector: embedding,
      property: 'embedding',
      similarity: 0.3,  // Lowered from 0.8 to get more matches
      limit: 10,        // Defaults to `10`
      offset: 0,        // Defaults to `0`
    });

    console.log(`Found ${hits.length} relevant hits with similarity >= 0.3`);

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

    console.log(`Context sections length: ${contextSections.length} characters`);
    console.log(`Context sections preview: ${contextSections.substring(0, 200)}...`);

    // If no context found, provide a fallback
    if (!contextSections.trim()) {
      contextSections = "This is Phil Tompkins' portfolio documentation. It contains information about his projects, work experience, fun projects, and adventures.";
    }

    // Ask Grok
    const prompt = `You are Philbot, a friendly robot assistant that helps people learn about Phil Tompkins' portfolio and background. Your name is Philbot. You are knowledgeable about Phil's projects, work experience, and everything included here based on the documentation provided.

Given the following sections from documentation, answer the question using the information here. If you are unsure and the answer isn't in the documentation, you can say "Sorry, Phil hasn't shared that information with me yet.".

Context sections:
${contextSections}


Answer as markdown (including related code snippets if available):`

    console.log('Sending prompt to Grok...');
    console.log('Prompt preview:', prompt.substring(0, 500) + '...');

    const messages = [{
      role: 'system',
      content: prompt,
    },
    {
      role: 'user',
      content: question,
    }];

    console.log('About to call createChatCompletion...');
    const responseBody = await createChatCompletion(messages, xaiApiKey);
    console.log('createChatCompletion returned, returning response...');
    return responseBody;
  } catch (error) {
    console.error('Error in ask handler:', error);
    throw error;
  } finally {
    await db.close();
  }
}

module.exports = handleAsk;
