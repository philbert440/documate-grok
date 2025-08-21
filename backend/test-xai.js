require('dotenv').config();
const fetch = require('node-fetch');

const XAI_API_BASE = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-4'; // Updated model name

async function testXAIAPI() {
  console.log('Testing xAI API directly...');
  
  try {
    const response = await fetch(`${XAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 50,
        temperature: 0.4,
        stream: true,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    console.log('Response body type:', typeof response.body);
    console.log('Response body constructor:', response.body.constructor.name);
    console.log('Response body methods:', Object.getOwnPropertyNames(response.body));
    
    // Check if it has pipe method
    console.log('Has pipe method:', typeof response.body.pipe === 'function');
    
    // Try to read a small chunk
    const reader = response.body.getReader();
    const { done, value } = await reader.read();
    console.log('First chunk done:', done);
    console.log('First chunk value:', value);
    if (value) {
      console.log('First chunk as string:', value.toString());
    }
    
  } catch (error) {
    console.error('Error testing xAI API:', error);
  }
}

testXAIAPI(); 