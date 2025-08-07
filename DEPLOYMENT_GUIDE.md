# StudentsAI MVP Deployment Guide

This guide provides step-by-step instructions for deploying the StudentsAI MVP to production environments.

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway (free tier available)
- **Database**: Railway PostgreSQL

### Option 2: Netlify + Heroku
- **Frontend**: Netlify
- **Backend**: Heroku
- **Database**: Heroku PostgreSQL

### Option 3: VPS/Cloud Server
- **Server**: DigitalOcean, AWS EC2, or similar
- **Database**: Managed PostgreSQL or self-hosted

## 🚀 Quick Deployment (Vercel + Railway)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Configure Backend Service**
   ```bash
   # Railway will auto-detect the backend
   # Add environment variables in Railway dashboard:
   DATABASE_URL=postgresql://...  # Railway will provide this
   OPENAI_API_KEY=your-openai-key
   SECRET_KEY=your-secret-key-here
   DEBUG=false
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Add PostgreSQL Database**
   - In Railway dashboard, click "Add Service"
   - Select "PostgreSQL"
   - Railway will automatically set DATABASE_URL

5. **Deploy**
   - Railway will automatically deploy on git push
   - Note your backend URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Build Settings**
   ```bash
   # Build Command: npm run build
   # Output Directory: .next
   # Install Command: npm install
   ```

4. **Add Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Vercel will automatically deploy
   - Your app will be available at `https://your-app.vercel.app`

## 🔧 Manual VPS Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx nodejs npm

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE studentsai_mvp;
CREATE USER studentsai WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE studentsai_mvp TO studentsai;
\q
EOF
```

### Step 3: Backend Deployment

```bash
# Clone repository
git clone https://github.com/your-username/studentsai-mvp.git
cd studentsai-mvp/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create production environment file
cat > .env << EOF
DATABASE_URL=postgresql://studentsai:secure_password_here@localhost:5432/studentsai_mvp
OPENAI_API_KEY=your-openai-key
SECRET_KEY=your-very-secure-secret-key
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
HOST=0.0.0.0
PORT=8000
EOF

# Run database migrations
alembic upgrade head

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'studentsai-backend',
    script: 'venv/bin/uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/path/to/studentsai-mvp/backend',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Frontend Deployment

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create production environment
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
EOF

# Build for production
npm run build

# Start with PM2
pm2 start npm --name "studentsai-frontend" -- start
```

### Step 5: Nginx Configuration

```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/studentsai << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/studentsai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Production Security Checklist

### Backend Security
- [ ] Change default SECRET_KEY
- [ ] Use strong database passwords
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Use environment variables for secrets
- [ ] Set up monitoring and logging

### Frontend Security
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Remove development tools
- [ ] Minify and optimize assets
- [ ] Set up error monitoring

### Server Security
- [ ] Configure firewall (UFW)
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Keep system updated
- [ ] Set up fail2ban
- [ ] Configure log rotation

## 📊 Monitoring and Maintenance

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs studentsai-backend
pm2 logs studentsai-frontend

# Restart services
pm2 restart all
```

### Database Maintenance

```bash
# Backup database
pg_dump -U studentsai -h localhost studentsai_mvp > backup_$(date +%Y%m%d).sql

# Restore database
psql -U studentsai -h localhost studentsai_mvp < backup_20240101.sql
```

### Performance Optimization

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Monitor slow queries

2. **Frontend Optimization**
   - Enable gzip compression in Nginx
   - Set up CDN for static assets
   - Implement caching strategies

3. **Backend Optimization**
   - Use Redis for session storage
   - Implement API response caching
   - Monitor memory usage

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check database connectivity
   psql -U studentsai -h localhost studentsai_mvp
   ```

2. **Frontend Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Backend Import Errors**
   ```bash
   # Check Python path and virtual environment
   which python
   pip list
   ```

4. **Nginx Configuration Issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Health Checks

Create health check endpoints:

```python
# Backend health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

```bash
# Monitor health
curl https://yourdomain.com/api/health
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for shared session storage
- Implement database read replicas

### Vertical Scaling
- Monitor resource usage
- Upgrade server specifications
- Optimize database queries
- Implement caching layers

---

**Need help with deployment? Check the troubleshooting section or create an issue in the repository.**

