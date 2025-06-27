// @see https://docs.aircode.io/guide/functions/
const aircode = require('aircode');
const fetch = require('node-fetch');
const { create, insertMultiple, searchVector } = require('@orama/orama');
const tokenizer = require('gpt-3-encoder');

const MAX_CONTEXT_TOKEN = 1500;
const PagesTable = aircode.db.table('pages');

// xAI API configuration
const XAI_API_BASE = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-3-mini';

// Helper function to create embeddings using xAI API
async function createEmbedding(text, apiKey) {
  const response = await fetch(`${XAI_API_BASE}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'embedding-001',
      input: text.replace(/\n/g, ' '),
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

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
    throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
  }

  return response.body;
}

// Helper function to create a readable stream from xAI response
function createReadableStream(responseBody) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  return new ReadableStream({
    async start(controller) {
      const reader = responseBody.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            break;
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                controller.close();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  const content = parsed.choices[0].delta.content;
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

module.exports = async function (params, context) {
  if (!process.env.XAI_API_KEY) {
    console.log('Missing environment variable XAI_API_KEY. Abort.');
    context.status(400);
    return {
      error:
        'You are missing some params, please open AirCode and find the details in Logs section',
    };
  }

  if (!params.question) {
    console.log('Missing param `question`. Abort.');
    context.status(400);
    return {
      error:
        'You are missing some params, please open AirCode and find the details in Logs section',
    };
  }

  try {
    const apiKey = process.env.XAI_API_KEY;

    // Moderate the content (xAI doesn't have a separate moderation API, so we'll skip this for now)
    const question = params.question.trim();
    
    // Create embedding from the question
    const embedding = await createEmbedding(question, apiKey);
    
    // Get all pages
    const { project = 'default' } = params;
    const pages = await PagesTable
      .where({ project })
      .projection({ path: 1, title: 1, content: 1, embedding: 1, _id: 0 })
      .find();

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

    const responseBody = await createChatCompletion(messages, apiKey);
    const stream = createReadableStream(responseBody);
    
    return stream;
  } catch (error) {
    console.error(error);
    context.status(500);
    return {
      error: 'Failed to generate answer.',
    };
  }
} 