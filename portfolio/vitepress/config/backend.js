// Backend configuration utility
// This file is used during build time and runtime

// Default backend URL
const DEFAULT_BACKEND_URL = 'https://backend.philtompkins.com'

// Get backend URL from environment or use default
export function getBackendUrl() {
  // In browser environment, use the global variable set by Vite
  if (typeof window !== 'undefined') {
    return window.__BACKEND_URL__ || DEFAULT_BACKEND_URL
  }

  // In Node.js environment, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env.BACKEND_URL || DEFAULT_BACKEND_URL
  }

  return DEFAULT_BACKEND_URL
}

// Get backend URL for specific endpoint
export function getBackendEndpoint(endpoint = 'ask') {
  const baseUrl = getBackendUrl()
  return `${baseUrl}/${endpoint}`
}

// Check if we're in production mode
export function isProduction() {
  if (typeof window !== 'undefined') {
    return window.__IS_PRODUCTION__ || false
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production' || process.env.BUILD_ENV === 'production'
  }

  return false
}

// Get environment info
export function getEnvironmentInfo() {
  return {
    backendUrl: getBackendUrl(),
    isProduction: isProduction(),
    nodeEnv: typeof process !== 'undefined' ? (process.env?.NODE_ENV || 'development') : 'browser',
    buildEnv: typeof process !== 'undefined' ? (process.env?.BUILD_ENV || 'development') : 'browser'
  }
}