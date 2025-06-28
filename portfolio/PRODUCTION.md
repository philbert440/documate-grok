# Philbot Frontend - Production Deployment Guide

This guide will help you deploy the Philbot frontend (VitePress) to production with HTTPS support.

## Prerequisites

- Node.js 18+ installed on your server
- Backend server running with HTTPS on backend.philtompkins.com
- Domain name pointing to your server
- Web server (nginx/Apache) configured for HTTPS

## Quick Start

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo>
   cd portfolio/vitepress
   cp env.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` file with your production settings:
   ```bash
   # Backend API Configuration
   BACKEND_URL=https://backend.philtompkins.com
   
   # Environment
   NODE_ENV=production
   BUILD_ENV=production
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

4. **Deploy the built files:**
   ```bash
   # Copy the built files to your web server
   cp -r .vitepress/dist/* /var/www/html/
   ```

## Build Commands

### Development Build
```bash
npm run docs:build
```

### Production Build
```bash
npm run docs:build:prod
```

### HTTPS Production Build
```bash
npm run docs:build:https
```

### Custom Backend URL
```bash
BACKEND_URL=https://backend.philtompkins.com npm run docs:build:prod
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BACKEND_URL` | Backend API URL | Yes | https://backend.philtompkins.com |
| `NODE_ENV` | Node environment | No | development |
| `BUILD_ENV` | Build environment | No | development |

## Web Server Configuration

### Nginx Configuration for Frontend (philtompkins.com)

Create `/etc/nginx/sites-available/philbot-frontend`:

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

### Nginx Configuration for Backend (backend.philtompkins.com)

Create `/etc/nginx/sites-available/philbot-backend`:

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
        proxy_pass https://backend.philtompkins.com;
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

### Enable the sites:

```bash
sudo ln -s /etc/nginx/sites-available/philbot-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/philbot-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Workflow

### 1. Build the Frontend

```bash
# Set environment variables
export BACKEND_URL=https://backend.philtompkins.com
export NODE_ENV=production
export BUILD_ENV=production

# Build the site
npm run docs:build:prod
```

### 2. Upload Documentation

```bash
# Upload documentation to backend
npm run documate:upload:prod
```

### 3. Deploy to Web Server

```bash
# Copy built files to web server
sudo cp -r .vitepress/dist/* /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: portfolio/vitepress/package-lock.json
    
    - name: Install dependencies
      run: |
        cd portfolio/vitepress
        npm ci
    
    - name: Build frontend
      run: |
        cd portfolio/vitepress
        BACKEND_URL=${{ secrets.BACKEND_URL }} \
        NODE_ENV=production \
        BUILD_ENV=production \
        npm run docs:build:prod
    
    - name: Upload documentation
      run: |
        cd portfolio/vitepress
        BACKEND_URL=${{ secrets.BACKEND_URL }} \
        npm run documate:upload:prod
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www
          sudo rm -rf html/*
          sudo cp -r /tmp/frontend/* html/
          sudo chown -R www-data:www-data html/
          sudo chmod -R 755 html/
```

## Testing

### Local Testing

```bash
# Build and preview locally
npm run docs:build:prod
npm run docs:preview
```

### Production Testing

```bash
# Test the deployed site
curl -I https://philtompkins.com

# Test backend connectivity
curl https://backend.philtompkins.com/health
```

## Troubleshooting

### Common Issues

1. **Backend Connection Errors:**
   - Verify backend URL is correct in `.env`
   - Check if backend is running with HTTPS
   - Test backend health endpoint

2. **Build Errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all environment variables are set

3. **Deployment Issues:**
   - Check file permissions on web server
   - Verify nginx configuration syntax
   - Check SSL certificate validity

### Debug Mode

For debugging, run with verbose output:

```bash
DEBUG=* npm run docs:build:prod
```

## Security Considerations

1. **HTTPS Only:**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS headers

2. **Content Security Policy:**
   - Configure CSP headers
   - Restrict resource loading

3. **Environment Variables:**
   - Never commit `.env` files
   - Use secrets management in CI/CD

## Performance Optimization

1. **Static Asset Caching:**
   - Configure long-term caching for static assets
   - Use cache busting for updates

2. **Compression:**
   - Enable gzip compression
   - Use Brotli for better compression

3. **CDN:**
   - Use CDN for static assets
   - Configure proper cache headers

## Monitoring

1. **Health Checks:**
   - Monitor frontend availability
   - Check backend connectivity

2. **Error Tracking:**
   - Set up error monitoring
   - Track user experience metrics

3. **Performance Monitoring:**
   - Monitor page load times
   - Track Core Web Vitals 