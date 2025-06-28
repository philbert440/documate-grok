# Philbot Backend - Production Deployment Guide

This guide will help you deploy the Philbot backend to production with HTTPS support.

## Prerequisites

- Node.js 18+ installed on your server
- SSL certificates (Let's Encrypt recommended)
- Domain name pointing to your server
- Firewall configured to allow ports 80, 443, and your backend port

## Quick Start

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo>
   cd backend
   cp env.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` file with your production settings:
   ```bash
   # Required API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   XAI_API_KEY=your_xai_api_key_here
   
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   
   # HTTPS Configuration
   ENABLE_HTTPS=true
   SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
   SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

4. **Start with PM2 (recommended for production):**
   ```bash
   npm run pm2:start:prod
   ```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

1. **Install Certbot:**
   ```bash
   sudo apt update
   sudo apt install certbot
   ```

2. **Obtain SSL certificate:**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Auto-renewal setup:**
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Option 2: Self-Signed Certificate (Development/Testing)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update .env file
SSL_CERT_PATH=./cert.pem
SSL_KEY_PATH=./key.pem
```

## PM2 Process Management

PM2 is included for production process management:

```bash
# Start in production mode
npm run pm2:start:prod

# Monitor processes
npm run pm2:monit

# View logs
npm run pm2:logs

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop

# Delete application from PM2
npm run pm2:delete
```

## Reverse Proxy Setup (Nginx)

For better security and performance, use Nginx as a reverse proxy:

### Nginx Configuration

Create `/etc/nginx/sites-available/philbot-backend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
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

### Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/philbot-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS, and your backend port
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Only if not using reverse proxy
sudo ufw enable
```

## Monitoring and Logs

### PM2 Monitoring

```bash
# Real-time monitoring
npm run pm2:monit

# View logs
npm run pm2:logs

# Check status
pm2 status
```

### Log Files

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `out.log` - Standard output
- `error.log` - Error logs

### Health Check

Test your deployment:

```bash
# HTTP (if not using HTTPS)
curl http://localhost:3000/health

# HTTPS
curl -k https://localhost:3000/health

# Through reverse proxy
curl https://yourdomain.com/health
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings | Yes | - |
| `XAI_API_KEY` | xAI API key for chat completions | Yes | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `ENABLE_HTTPS` | Enable HTTPS server | No | false |
| `SSL_CERT_PATH` | Path to SSL certificate | If HTTPS | - |
| `SSL_KEY_PATH` | Path to SSL private key | If HTTPS | - |

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors:**
   - Check file permissions: `sudo chmod 644 /etc/letsencrypt/live/yourdomain.com/fullchain.pem`
   - Verify certificate validity: `openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout`

2. **Port Already in Use:**
   - Check what's using the port: `sudo netstat -tulpn | grep :3000`
   - Kill the process or change the port

3. **Permission Denied:**
   - Ensure proper file permissions for SSL certificates
   - Check PM2 user permissions

4. **Database Issues:**
   - Ensure the `data/` directory exists and is writable
   - Run `npm run init-db` to initialize the database

### Debug Mode

For debugging, run without PM2:

```bash
NODE_ENV=development npm start
```

## Security Considerations

1. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

2. **Use environment variables for sensitive data**
3. **Enable firewall and configure properly**
4. **Use HTTPS in production**
5. **Regular security updates**
6. **Monitor logs for suspicious activity**

## Backup Strategy

1. **Database backup:**
   ```bash
   cp data/documate.db data/documate.db.backup.$(date +%Y%m%d)
   ```

2. **Environment configuration backup:**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d)
   ```

3. **SSL certificates backup:**
   ```bash
   sudo cp -r /etc/letsencrypt/live/yourdomain.com /backup/ssl/
   ``` 