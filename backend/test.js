const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Documate Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test upload endpoint
    console.log('\n2. Testing upload endpoint...');
    const uploadResponse = await axios.post(`${BASE_URL}/upload`, {
      operation: 'add',
      project: 'test',
      path: '/test-page',
      title: 'Test Page',
      content: '# Test Page\n\nThis is a test page for the Documate backend.'
    });
    console.log('✅ Upload test passed:', uploadResponse.data);

    // Test generate embeddings
    console.log('\n3. Testing generate embeddings...');
    const generateResponse = await axios.post(`${BASE_URL}/upload`, {
      operation: 'generate',
      project: 'test'
    });
    console.log('✅ Generate embeddings passed:', generateResponse.data);

    // Test ask endpoint
    console.log('\n4. Testing ask endpoint...');
    const askResponse = await axios.post(`${BASE_URL}/ask`, {
      question: 'What is this test page about?',
      project: 'test'
    }, {
      responseType: 'stream'
    });
    
    console.log('✅ Ask endpoint response received (streaming)');
    askResponse.data.on('data', (chunk) => {
      process.stdout.write(chunk.toString());
    });

    askResponse.data.on('end', () => {
      console.log('\n\n🎉 All tests passed! Backend is working correctly.');
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = testBackend; 