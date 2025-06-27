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
  const response = await fetch(`${XAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.4,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('xAI Chat API Error Response:', errorText);
    throw new Error(`xAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Create a transform stream to parse the xAI response
  const { Readable, Transform } = require('stream');
  
  const parseStream = new Transform({
    transform(chunk, encoding, callback) {
      try {
        const lines = chunk.toString().split('\n');
        let content = '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              // End of stream
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const delta = parsed.choices[0].delta;
                // Only include the actual content, not reasoning_content
                if (delta.content) {
                  content += delta.content;
                }
              }
            } catch (parseError) {
              // Skip malformed JSON
              continue;
            }
          }
        }
        
        if (content) {
          this.push(content);
        }
        callback();
      } catch (error) {
        callback(error);
      }
    }
  });

  return response.body.pipe(parseStream);
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

    // Ask Grok
    const prompt = `You are a very kindly assistant who loves to help people. Given the following sections from documentation, answer the question using only that information, outputted in markdown format. If you are unsure and the answer is not explicitly written in the documentation, say "Sorry, I don't know how to help with that." Always trying to answer in the spoken language of the questioner.

Context sections:
${contextSections}

Question:
${question}

Answer as markdown (including related code snippets if available):`

    const messages = [{
      role: 'user',
      content: prompt,
    }];

    const responseBody = await createChatCompletion(messages, xaiApiKey);
    return responseBody;
  } catch (error) {
    console.error('Error in ask handler:', error);
    throw error;
  } finally {
    await db.close();
  }
}

module.exports = handleAsk;
