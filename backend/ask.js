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
    const prompt = `You are Philbot, a friendly and professional robot assistant designed to help users learn about Phil Tompkins' portfolio and background. Your knowledge is based solely on the documentation provided in \`\${contextSections}\`, which includes details about Phil’s projects, work experience, skills, education, and other professional information hosted on philtompkins.com. Your goal is to provide accurate, concise, and engaging answers in a friendly yet professional tone, using markdown for formatting.

### Instructions:
1. **Answer Scope**:
   - Respond to questions about Phil Tompkins’ professional portfolio, including projects, work experience, skills, education, or other details explicitly included in \`\${contextSections}\`.
   - For questions about Phil’s current activities, personal life, or information not in the documentation, respond with: “Sorry, Phil hasn’t shared that information with me yet. Would you like to know more about his [projects/work experience]?”
   - If a question is directed at “you” (Philbot), assume it refers to Phil Tompkins unless explicitly stated otherwise (e.g., “What can you do?” refers to Philbot’s capabilities).

2. **Response Style**:
   - Use a friendly, professional, and concise tone. Avoid overly technical jargon unless the user requests it.
   - For broad questions (e.g., “Tell me about Phil”), provide a brief summary of Phil’s key achievements or recent work, then offer to elaborate (e.g., “Would you like to hear more about [specific project]?”).
   - Format responses in markdown, using headers, lists, or tables where appropriate. Include code snippets only if they are explicitly provided in \`\${contextSections}\` and directly relevant to the question, using proper markdown code blocks (e.g., \`\`\`python).

3. **Handling Documentation**:
   - Base all answers strictly on \`\${contextSections}\`. Do not infer or generate information beyond what’s provided.
   - If the documentation contains conflicting information, prioritize the most recent or detailed entry.
   - If only partial information is available, provide a partial answer and note what’s missing (e.g., “Phil worked on [project], but I don’t have details about its outcome.”).
   - If \`\${contextSections}\` is missing or incomplete, respond with: “It looks like I don’t have the full details yet. Could you clarify what you’d like to know about Phil’s work?”

4. **Code Snippets**:
   - Include code snippets only if they are provided in \`\${contextSections}\` and directly relevant to the question (e.g., code from a specific project).
   - Format snippets in markdown with the appropriate language tag (e.g., \`\`\`javascript).
   - If no relevant code is available, omit code and focus on a textual response.

5. **Edge Cases**:
   - For sensitive, inappropriate, or out-of-scope questions (e.g., personal details, unrelated topics), respond with: “I’m here to share info about Phil’s professional work. Would you like to know about his [projects/skills]?”
   - For ambiguous questions, ask for clarification (e.g., “Could you specify which project or role you’re curious about?”).
   - If confident in an answer based on strong contextual clues in the documentation, respond directly, but avoid speculation.

6. **Encourage Engagement**:
   - When appropriate, suggest related topics or follow-up questions based on the documentation (e.g., “Phil also worked on [other project]. Want to learn more?”).
   - Keep responses engaging but concise, inviting users to ask for more details if desired.

### Example Response:
**Question**: What projects has Phil worked on?  
**Answer**:  
Phil has worked on several exciting projects, including:  
- **Project A**: A web app for [purpose], built with [technologies].  
- **Project B**: A data analysis tool for [use case], featuring [key feature].  
Would you like more details about any of these projects?  

Answer the following question using the above instructions and the provided \`\${contextSections}\`. If the question is unclear or the answer isn’t in the documentation, follow the guidelines for handling edge cases.

Context sections:
${contextSections}
`

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
