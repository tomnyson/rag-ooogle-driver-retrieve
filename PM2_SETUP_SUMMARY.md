# PM2 Setup - Summary

## 📦 Files Created

### Configuration
- ✅ `ecosystem.config.js` - PM2 configuration file
- ✅ `package.json` - Updated with PM2 scripts

### Scripts
- ✅ `scripts/pm2-setup.sh` - Interactive PM2 management
- ✅ `scripts/pm2-quick-start.sh` - One-command deployment
- ✅ `scripts/README.md` - Scripts documentation

### Documentation
- ✅ `PM2_GUIDE.md` - Complete PM2 guide
- ✅ `PM2_CHEATSHEET.md` - Quick reference
- ✅ `PM2_SETUP_SUMMARY.md` - This file
- ✅ `README.md` - Updated with PM2 instructions

## 🚀 Quick Start

### Option 1: One-Command Setup (Easiest)

```bash
./scripts/pm2-quick-start.sh
```

### Option 2: NPM Scripts

```bash
# Install PM2
npm install -g pm2

# Start services
npm run pm2:start

# View status
npm run pm2:status

# View logs
npm run pm2:logs
```

### Option 3: Manual PM2 Commands

```bash
# Install PM2
npm install -g pm2

# Start with ecosystem file
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs
```

## 📋 Available NPM Scripts

```json
{
  "pm2:start": "pm2 start ecosystem.config.js",
  "pm2:stop": "pm2 stop ecosystem.config.js",
  "pm2:restart": "pm2 restart ecosystem.config.js",
  "pm2:reload": "pm2 reload ecosystem.config.js",
  "pm2:delete": "pm2 delete ecosystem.config.js",
  "pm2:logs": "pm2 logs",
  "pm2:monit": "pm2 monit",
  "pm2:status": "pm2 status"
}
```

## 🎯 Use Cases

### Development
```bash
npm run api
npm run cron
```

### Production
```bash
npm run pm2:start
```

### Monitoring
```bash
npm run pm2:status
npm run pm2:logs
npm run pm2:monit
```

### Maintenance
```bash
npm run pm2:restart
npm run pm2:stop
```

## 📊 Ecosystem Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'rag-api',
      script: './api-server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
    },
    {
      name: 'rag-cron',
      script: './cron-server.js',
      // ... similar config
    },
  ],
};
```

## 🔧 Customization

### Change Memory Limit

```javascript
// ecosystem.config.js
max_memory_restart: '1G',  // 1GB instead of 500MB
```

### Enable Watch Mode

```javascript
// ecosystem.config.js
watch: true,
ignore_watch: ['node_modules', 'logs', '.git'],
```

### Cluster Mode

```javascript
// ecosystem.config.js
instances: 4,        // or 'max' for all CPUs
exec_mode: 'cluster',
```

### Cron Restart

```javascript
// ecosystem.config.js
cron_restart: '0 0 * * *',  // Restart daily at midnight
```

## 🔄 Auto-start on Boot

```bash
# Setup
pm2 startup

# Run the suggested command (with sudo)
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Start your services
npm run pm2:start

# Save process list
pm2 save
```

## 📝 Logs

Logs are stored in `./logs/`:

```
logs/
├── api-error.log      # API errors
├── api-out.log        # API output
├── cron-error.log     # Cron errors
└── cron-out.log       # Cron output
```

View logs:
```bash
npm run pm2:logs
pm2 logs rag-api
pm2 logs rag-cron
```

## 🐛 Troubleshooting

### PM2 not found
```bash
npm install -g pm2
```

### Services not starting
```bash
# Check logs
pm2 logs --err

# Check .env file
cat .env

# Restart with update-env
pm2 restart ecosystem.config.js --update-env
```

### Port already in use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
API_PORT=3001
```

### Memory issues
```bash
# Increase memory limit
# Edit ecosystem.config.js
max_memory_restart: '1G',

# Restart
npm run pm2:restart
```

## 📚 Documentation

- **[PM2_GUIDE.md](PM2_GUIDE.md)** - Complete guide with examples
- **[PM2_CHEATSHEET.md](PM2_CHEATSHEET.md)** - Quick command reference
- **[scripts/README.md](scripts/README.md)** - Scripts documentation
- **[README.md](README.md)** - Main project documentation

## ✅ Checklist

Before deploying to production:

- [ ] PM2 installed globally
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install --production`)
- [ ] Logs directory created (`mkdir -p logs`)
- [ ] Services started (`npm run pm2:start`)
- [ ] Auto-start configured (`pm2 startup && pm2 save`)
- [ ] Logs verified (`npm run pm2:logs`)
- [ ] Status checked (`npm run pm2:status`)

## 🎉 Success!

Your application is now running with PM2:

```bash
# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Monitor
npm run pm2:monit
```

Services:
- **API Server:** http://localhost:3000
- **Cron Job:** Running in background

---

**Need help?** Check [PM2_GUIDE.md](PM2_GUIDE.md) for detailed documentation.
