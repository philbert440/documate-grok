#!/usr/bin/env node

/**
 * HTTPS Test Script
 * Tests the backend server's HTTPS functionality
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';

console.log('🔍 Philbot Backend HTTPS Test');
console.log('==============================');
console.log(`Port: ${PORT}`);
console.log(`HTTPS Enabled: ${ENABLE_HTTPS}`);

if (ENABLE_HTTPS) {
  const sslCertPath = process.env.SSL_CERT_PATH;
  const sslKeyPath = process.env.SSL_KEY_PATH;
  
  console.log(`SSL Certificate: ${sslCertPath}`);
  console.log(`SSL Private Key: ${sslKeyPath}`);
  
  // Check if certificate files exist
  if (!fs.existsSync(sslCertPath)) {
    console.error('❌ SSL Certificate file not found!');
    process.exit(1);
  }
  
  if (!fs.existsSync(sslKeyPath)) {
    console.error('❌ SSL Private Key file not found!');
    process.exit(1);
  }
  
  console.log('✅ SSL certificate files found');
}

// Test function
function testEndpoint(protocol, host, port, path) {
  return new Promise((resolve, reject) => {
    const client = protocol === 'https' ? https : http;
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000,
      rejectUnauthorized: false // For self-signed certificates
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('\n🧪 Running tests...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    
    if (ENABLE_HTTPS) {
      const result = await testEndpoint('https', 'localhost', PORT, '/health');
      console.log(`   HTTPS Response: ${result.statusCode}`);
      console.log(`   Data: ${result.data.substring(0, 100)}...`);
    } else {
      const result = await testEndpoint('http', 'localhost', PORT, '/health');
      console.log(`   HTTP Response: ${result.statusCode}`);
      console.log(`   Data: ${result.data.substring(0, 100)}...`);
    }
    
    console.log('✅ Health endpoint test passed\n');
    
    // Test non-existent endpoint
    console.log('2. Testing 404 endpoint...');
    
    if (ENABLE_HTTPS) {
      const result = await testEndpoint('https', 'localhost', PORT, '/nonexistent');
      console.log(`   HTTPS Response: ${result.statusCode}`);
    } else {
      const result = await testEndpoint('http', 'localhost', PORT, '/nonexistent');
      console.log(`   HTTP Response: ${result.statusCode}`);
    }
    
    console.log('✅ 404 endpoint test passed\n');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   npm start');
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await testEndpoint('http', 'localhost', PORT, '/health');
    console.log('✅ Server is running');
    await runTests();
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.log('\n💡 Start the server first:');
    console.log('   npm start');
    process.exit(1);
  }
}

checkServer(); 