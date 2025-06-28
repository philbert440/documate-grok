#!/usr/bin/env node

/**
 * Build Configuration Script
 * Updates documate.json and other configuration files based on environment variables
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const env = process.env
const backendUrl = env.BACKEND_URL || 'http://localhost:3000'
const nodeEnv = env.NODE_ENV || 'development'
const buildEnv = env.BUILD_ENV || 'development'

console.log('🔧 Building configuration...')
console.log(`   Backend URL: ${backendUrl}`)
console.log(`   Node Environment: ${nodeEnv}`)
console.log(`   Build Environment: ${buildEnv}`)

// Update documate.json
function updateDocumateConfig() {
  const documatePath = path.join(__dirname, '..', 'documate.json')
  
  const config = {
    root: ".",
    include: [
      "**/*.md"
    ],
    backend: backendUrl
  }
  
  fs.writeFileSync(documatePath, JSON.stringify(config, null, 2))
  console.log('✅ Updated documate.json')
}

// Create environment info file for debugging
function createEnvInfo() {
  const envInfo = {
    backendUrl,
    nodeEnv,
    buildEnv,
    timestamp: new Date().toISOString(),
    isProduction: nodeEnv === 'production' || buildEnv === 'production'
  }
  
  const envInfoPath = path.join(__dirname, '..', '.vitepress', 'env-info.json')
  fs.writeFileSync(envInfoPath, JSON.stringify(envInfo, null, 2))
  console.log('✅ Created env-info.json')
}

// Main execution
try {
  updateDocumateConfig()
  createEnvInfo()
  console.log('🎉 Configuration build complete!')
} catch (error) {
  console.error('❌ Configuration build failed:', error.message)
  process.exit(1)
} 