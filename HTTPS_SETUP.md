# Philbot HTTPS Setup Guide

This guide covers the complete HTTPS setup for both the backend and frontend of the Philbot project.

## Architecture Overview

```
┌─────────────────────┐    HTTPS    ┌─────────────────────┐
│   Frontend          │ ──────────→ │   Backend           │
│ philtompkins.com    │             │ backend.philtompkins.com │
│ (VitePress)         │             │ (Express + HTTPS)   │
└─────────────────────┘             └─────────────────────┘
```

## Domain Structure

- **Frontend**: `https://philtompkins.com` - VitePress documentation site
- **Backend**: `https://backend.philtompkins.com` - Express API server

## Backend HTTPS Setup

### 1. Environment Configuration

Create `.env` file in the `backend/` directory:

```bash
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
XAI_API_KEY=your_xai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# HTTPS Configuration
ENABLE_HTTPS=true
SSL_CERT_PATH=/etc/letsencrypt/live/backend.philtompkins.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/backend.philtompkins.com/privkey.pem
```

### 2. SSL Certificate Setup

```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Obtain SSL certificate for backend subdomain
sudo certbot certonly --standalone -d backend.philtompkins.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Start Backend with HTTPS

```bash
cd backend

# Install dependencies
npm install

# Initialize database
npm run init-db

# Start with PM2 (production)
npm run pm2:start:prod

# Or start directly
npm run start:prod
```

### 4. Test Backend HTTPS

```bash
# Test health endpoint
curl -k https://backend.philtompkins.com/health

# Test HTTPS functionality
npm run test:https
```

## Frontend HTTPS Setup

### 1. Environment Configuration

Create `.env` file in the `portfolio/vitepress/` directory:

```bash
# Backend API Configuration
BACKEND_URL=https://backend.philtompkins.com

# Environment
NODE_ENV=production
BUILD_ENV=production
```

### 2. Build Frontend for Production

```bash
cd portfolio/vitepress

# Install dependencies
npm install

# Build with HTTPS backend
npm run docs:build:https

# Or build with custom backend URL
BACKEND_URL=https://backend.philtompkins.com npm run docs:build:prod
```

### 3. Upload Documentation

```bash
# Upload documentation to backend
npm run documate:upload:prod
```

## Web Server Configuration (Nginx)

### Frontend Configuration (`/etc/nginx/sites-available/philbot-frontend`)

```nginx
server {
    listen 80;
    server_name philtompkins.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name philtompkins.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/philtompkins.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/philtompkins.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Document root
    root /var/www/html;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### Backend Configuration (`/etc/nginx/sites-available/philbot-backend`)

```nginx
server {
    listen 80;
    server_name backend.philtompkins.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name backend.philtompkins.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/backend.philtompkins.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.philtompkins.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CORS headers for frontend
    add_header Access-Control-Allow-Origin "https://philtompkins.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Sites

```bash
sudo ln -s /etc/nginx/sites-available/philbot-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/philbot-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Commands

### Backend Deployment

```bash
cd backend

# Run deployment script
./deploy.sh

# Start with PM2
npm run pm2:start:prod

# Monitor
npm run pm2:monit
```

### Frontend Deployment

```bash
cd portfolio/vitepress

# Run deployment script
./deploy.sh

# Deploy built files
sudo cp -r .vitepress/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

## Testing

### Test Backend

```bash
# Health check
curl https://backend.philtompkins.com/health

# Test HTTPS functionality
cd backend && npm run test:https
```

### Test Frontend

```bash
# Test site
curl -I https://philtompkins.com

# Test backend connectivity from frontend
# The Philbot chat should work on the frontend
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors:**
   - Check certificate paths in `.env` files
   - Verify certificates are valid: `openssl x509 -in /path/to/cert.pem -text -noout`
   - Ensure proper file permissions

2. **CORS Errors:**
   - Verify CORS headers in nginx backend configuration
   - Check that frontend domain matches CORS origin

3. **Backend Connection Errors:**
   - Verify backend URL in frontend `.env`
   - Check if backend is running: `pm2 status`
   - Test backend directly: `curl https://backend.philtompkins.com/health`

4. **Build Errors:**
   - Clear node_modules and reinstall
   - Check environment variables are set correctly
   - Verify Node.js version compatibility

### Debug Commands

```bash
# Check backend status
pm2 status
pm2 logs philbot-backend

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificates
sudo certbot certificates

# Test HTTPS endpoints
curl -k https://backend.philtompkins.com/health
curl -I https://philtompkins.com
```

## Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] SSL certificates valid and auto-renewing
- [ ] HSTS headers configured
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Firewall configured
- [ ] Environment variables secured
- [ ] PM2 process management active
- [ ] Logging and monitoring set up

## Performance Optimization

- [ ] Gzip compression enabled
- [ ] Static asset caching configured
- [ ] CDN configured (if applicable)
- [ ] Database optimized
- [ ] PM2 clustering enabled

## Monitoring

- [ ] Health checks configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] SSL certificate monitoring
- [ ] Uptime monitoring configured 