module.exports = {
  apps: [{
    name: 'philbot-backend',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      ENABLE_HTTPS: 'true',
      SSL_CERT_PATH: '/etc/letsencrypt/live/backend.philtompkins.com/fullchain.pem',
      SSL_KEY_PATH: '/etc/letsencrypt/live/backend.philtompkins.com/privkey.pem'
    },
    // Logging configuration
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart configuration
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Watch configuration (for development)
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data'],
    
    // Health check
    health_check_grace_period: 3000,
    
    // Environment variables that should be loaded from .env file
    env_file: '.env'
  }]
}; 