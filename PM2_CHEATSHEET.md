# PM2 Cheat Sheet

Quick reference cho các PM2 commands thường dùng.

## 🚀 Start/Stop/Restart

```bash
# Start
npm run pm2:start
pm2 start ecosystem.config.js
pm2 start api-server.js --name rag-api

# Stop
npm run pm2:stop
pm2 stop all
pm2 stop rag-api

# Restart
npm run pm2:restart
pm2 restart all
pm2 restart rag-api

# Reload (zero-downtime)
npm run pm2:reload
pm2 reload all

# Delete
npm run pm2:delete
pm2 delete all
pm2 delete rag-api
```

## 📊 Monitoring

```bash
# Status
npm run pm2:status
pm2 status
pm2 list
pm2 ls

# Logs
npm run pm2:logs
pm2 logs
pm2 logs rag-api
pm2 logs --lines 100
pm2 logs --err

# Monitor
npm run pm2:monit
pm2 monit

# Info
pm2 show rag-api
pm2 describe rag-api
```

## 🔧 Management

```bash
# Flush logs
pm2 flush

# Reset restart counter
pm2 reset all

# Update PM2
pm2 update

# Save process list
pm2 save

# Resurrect
pm2 resurrect

# Kill PM2 daemon
pm2 kill
```

## 🔄 Auto-start on Boot

```bash
# Setup
pm2 startup
# Run suggested command
pm2 save

# Disable
pm2 unstartup

# Update startup script
pm2 startup
pm2 save --force
```

## 📝 Ecosystem File

```bash
# Start with ecosystem
pm2 start ecosystem.config.js

# Start specific app
pm2 start ecosystem.config.js --only rag-api

# Update env
pm2 restart ecosystem.config.js --update-env

# Different environments
pm2 start ecosystem.config.js --env production
pm2 start ecosystem.config.js --env development
```

## 🔍 Logs

```bash
# All logs
pm2 logs

# Specific app
pm2 logs rag-api

# Last N lines
pm2 logs --lines 50

# Only errors
pm2 logs --err

# Only output
pm2 logs --out

# No color
pm2 logs --nostream

# JSON format
pm2 logs --json

# Flush all logs
pm2 flush
```

## 📈 Process Management

```bash
# Scale (cluster mode)
pm2 scale rag-api 4

# Reload with zero-downtime
pm2 reload all

# Graceful reload
pm2 gracefulReload all

# Send signal
pm2 sendSignal SIGUSR2 rag-api
```

## 🔐 Environment Variables

```bash
# Set env
pm2 start app.js --env production

# Update env
pm2 restart app.js --update-env

# In ecosystem.config.js
env: {
  NODE_ENV: 'production',
  API_PORT: 3000
},
env_development: {
  NODE_ENV: 'development',
  API_PORT: 3001
}
```

## 🎯 Useful Options

```bash
# Watch mode
pm2 start app.js --watch

# Ignore watch
pm2 start app.js --watch --ignore-watch="node_modules logs"

# Max memory restart
pm2 start app.js --max-memory-restart 500M

# Cron restart
pm2 start app.js --cron-restart="0 0 * * *"

# No auto restart
pm2 start app.js --no-autorestart

# Instances
pm2 start app.js -i 4
pm2 start app.js -i max
```

## 🔌 PM2 Plus

```bash
# Link to PM2 Plus
pm2 link <secret> <public>

# Unlink
pm2 unlink

# Web interface
pm2 web
```

## 🔧 Modules

```bash
# Install module
pm2 install pm2-logrotate

# List modules
pm2 module:list

# Uninstall module
pm2 uninstall pm2-logrotate

# Update module
pm2 module:update pm2-logrotate
```

## 📦 Log Rotation

```bash
# Install
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# View config
pm2 conf pm2-logrotate
```

## 🐛 Debugging

```bash
# Show error logs
pm2 logs --err

# Show specific app logs
pm2 logs rag-api --lines 100

# Describe process
pm2 describe rag-api

# Monitor
pm2 monit

# Prettyprint
pm2 prettylist
```

## 💾 Backup & Restore

```bash
# Save current process list
pm2 save

# Dump process list to file
pm2 dump

# Restore from dump
pm2 resurrect

# Delete dump file
pm2 cleardump
```

## 🔄 Update & Maintenance

```bash
# Update PM2
npm install -g pm2@latest
pm2 update

# Check for updates
pm2 update

# Kill and restart PM2
pm2 kill
pm2 resurrect
```

## 📊 Cluster Mode

```bash
# Start in cluster mode
pm2 start app.js -i 4

# Use all CPUs
pm2 start app.js -i max

# Scale up/down
pm2 scale app +2
pm2 scale app 4

# Reload cluster
pm2 reload app
```

## 🎨 Output Formatting

```bash
# JSON output
pm2 jlist

# Prettified list
pm2 prettylist

# Simple list
pm2 list

# Compact list
pm2 ls
```

## 🔍 Process Info

```bash
# Show process info
pm2 show rag-api

# Describe process
pm2 describe rag-api

# Process ID
pm2 id rag-api

# Process path
pm2 info rag-api
```

## ⚡ Quick Commands

```bash
# Start all
pm2 start all

# Stop all
pm2 stop all

# Restart all
pm2 restart all

# Delete all
pm2 delete all

# Reload all
pm2 reload all

# Reset all
pm2 reset all
```

## 📱 Ecosystem Config Example

```javascript
module.exports = {
  apps: [{
    name: 'app',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    cron_restart: '0 0 * * *',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

## 🔗 Useful Links

- [PM2 Docs](https://pm2.keymetrics.io/docs/)
- [PM2 GitHub](https://github.com/Unitech/pm2)
- [PM2 Plus](https://pm2.io/)

---

**Tip:** Add `alias pm2='pm2 --color'` to your `.bashrc` or `.zshrc` for colored output!
