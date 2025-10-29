# PM2 Deployment Guide

## 📦 Cài đặt PM2

```bash
# Cài đặt PM2 globally
npm install -g pm2

# Kiểm tra version
pm2 --version
```

## 🚀 Quick Start

### Cách 1: Sử dụng npm scripts (Recommended)

```bash
# Start cả API và Cron
npm run pm2:start

# Xem status
npm run pm2:status

# Xem logs
npm run pm2:logs

# Restart services
npm run pm2:restart

# Stop services
npm run pm2:stop

# Monitor dashboard
npm run pm2:monit
```

### Cách 2: Sử dụng PM2 trực tiếp

```bash
# Start với ecosystem file
pm2 start ecosystem.config.cjs

# Hoặc start từng service riêng
pm2 start api-server.js --name rag-api
pm2 start cron-server.js --name rag-cron
```

### Cách 3: Sử dụng setup script

```bash
# Chạy interactive setup
./scripts/pm2-setup.sh
```

## 📋 PM2 Commands

### Quản lý Services

```bash
# Start
pm2 start ecosystem.config.cjs
npm run pm2:start

# Stop
pm2 stop all                    # Stop tất cả
pm2 stop rag-api               # Stop API only
pm2 stop rag-cron              # Stop Cron only
npm run pm2:stop

# Restart
pm2 restart all
pm2 restart rag-api
npm run pm2:restart

# Reload (zero-downtime restart)
pm2 reload all
npm run pm2:reload

# Delete (remove from PM2)
pm2 delete all
pm2 delete rag-api
npm run pm2:delete
```

### Monitoring

```bash
# Status
pm2 status
pm2 list
npm run pm2:status

# Logs
pm2 logs                       # All logs
pm2 logs rag-api              # API logs only
pm2 logs rag-cron             # Cron logs only
pm2 logs --lines 100          # Last 100 lines
npm run pm2:logs

# Monitor dashboard
pm2 monit
npm run pm2:monit

# Process info
pm2 show rag-api
pm2 describe rag-api
```

### Advanced

```bash
# Flush logs
pm2 flush

# Reset restart counter
pm2 reset all

# Update PM2
pm2 update

# Save process list
pm2 save

# Resurrect saved processes
pm2 resurrect
```

## ⚙️ Configuration (ecosystem.config.cjs)

```javascript
module.exports = {
  apps: [
    {
      name: 'rag-api',              // Tên process
      script: './api-server.js',    // File chạy
      instances: 1,                 // Số instances
      exec_mode: 'fork',            // fork hoặc cluster
      autorestart: true,            // Auto restart khi crash
      watch: false,                 // Watch file changes
      max_memory_restart: '500M',   // Restart nếu vượt quá RAM
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    // ... rag-cron config
  ],
};
```

### Tùy chỉnh Configuration

```javascript
// Thêm environment variables
env: {
  NODE_ENV: 'production',
  API_PORT: 3000,
},

// Development environment
env_development: {
  NODE_ENV: 'development',
  API_PORT: 3001,
},

// Staging environment
env_staging: {
  NODE_ENV: 'staging',
  API_PORT: 3002,
},

// Cluster mode (multiple instances)
instances: 4,           // Hoặc 'max' để dùng tất cả CPU cores
exec_mode: 'cluster',

// Watch mode (auto-reload on file changes)
watch: true,
ignore_watch: ['node_modules', 'logs', '.git'],

// Cron restart
cron_restart: '0 0 * * *',  // Restart mỗi ngày lúc 00:00
```

## 🔄 Auto-start on Boot

### Setup

```bash
# Generate startup script
pm2 startup

# Chạy command được suggest (cần sudo)
# Ví dụ:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user

# Start services
pm2 start ecosystem.config.cjs

# Save process list
pm2 save
```

### Disable Auto-start

```bash
pm2 unstartup
```

## 📊 Monitoring & Logs

### Log Files

Logs được lưu trong thư mục `./logs/`:

```
logs/
├── api-error.log      # API errors
├── api-out.log        # API output
├── cron-error.log     # Cron errors
└── cron-out.log       # Cron output
```

### Real-time Monitoring

```bash
# Dashboard
pm2 monit

# Logs streaming
pm2 logs --lines 50

# Logs của service cụ thể
pm2 logs rag-api --lines 100
```

### PM2 Plus (Cloud Monitoring)

```bash
# Link to PM2 Plus
pm2 link <secret_key> <public_key>

# Unlink
pm2 unlink
```

## 🔧 Troubleshooting

### Service không start

```bash
# Xem logs chi tiết
pm2 logs rag-api --err

# Xem process info
pm2 show rag-api

# Restart với logs
pm2 restart rag-api --update-env
```

### Memory leak

```bash
# Set max memory restart
pm2 start ecosystem.config.cjs --max-memory-restart 500M

# Monitor memory
pm2 monit
```

### Port đã được sử dụng

```bash
# Kiểm tra port
lsof -i :3000
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>

# Hoặc thay đổi port trong .env
API_PORT=3001
```

### Logs quá lớn

```bash
# Flush logs
pm2 flush

# Rotate logs (cài pm2-logrotate)
pm2 install pm2-logrotate

# Configure logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 🎯 Best Practices

### 1. Environment Variables

```bash
# Sử dụng .env file
# PM2 sẽ tự động load .env nếu có dotenv trong code

# Hoặc set trong ecosystem.config.cjs
env: {
  NODE_ENV: 'production',
  API_PORT: 3000,
}
```

### 2. Log Management

```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M      # Max 10MB per file
pm2 set pm2-logrotate:retain 7          # Keep 7 days
pm2 set pm2-logrotate:compress true     # Compress old logs
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Daily at midnight
```

### 3. Memory Management

```javascript
// ecosystem.config.cjs
{
  max_memory_restart: '500M',  // Restart if > 500MB
  min_uptime: '10s',           // Min uptime before restart
  max_restarts: 10,            // Max restarts in 1 minute
}
```

### 4. Zero-downtime Deployment

```bash
# Use reload instead of restart
pm2 reload ecosystem.config.cjs

# Or with cluster mode
pm2 reload all
```

### 5. Health Checks

```javascript
// Thêm health check endpoint trong api-server.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
```

## 📱 PM2 Web Dashboard

```bash
# Install PM2 web interface
pm2 install pm2-server-monit

# Access at http://localhost:9615
```

## 🔐 Security

### 1. Run as non-root user

```bash
# Tạo user riêng
sudo useradd -m -s /bin/bash ragapp

# Chuyển ownership
sudo chown -R ragapp:ragapp /path/to/app

# Switch user
su - ragapp

# Start PM2
pm2 start ecosystem.config.cjs
```

### 2. Limit resources

```javascript
// ecosystem.config.cjs
{
  max_memory_restart: '500M',
  instances: 2,  // Limit instances
}
```

## 📚 Useful Links

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2 Plus](https://pm2.io/)
- [PM2 Log Rotation](https://github.com/keymetrics/pm2-logrotate)

## 🆘 Quick Commands Reference

```bash
# Start
npm run pm2:start

# Status
npm run pm2:status

# Logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop

# Monitor
npm run pm2:monit

# Delete
npm run pm2:delete
```
