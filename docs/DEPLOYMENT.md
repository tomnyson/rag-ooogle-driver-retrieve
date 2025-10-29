# Hướng dẫn Deploy

## 🐳 Deploy với Docker

### 1. Build và chạy với Docker Compose (Khuyến nghị)

```bash
# Tạo file .env với các thông tin cần thiết
cp env.sample .env
# Chỉnh sửa .env với credentials của bạn

# Build và chạy
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng service
docker-compose down
```

### 2. Build và chạy với Docker thông thường

```bash
# Build image
docker build -t rag-google-drive .

# Chạy container
docker run -d \
  --name rag-sync \
  --env-file .env \
  --restart unless-stopped \
  rag-google-drive

# Xem logs
docker logs -f rag-sync
```

## 🖥️ Deploy trên Linux Server (Ubuntu/Debian)

### 1. Cài đặt Node.js

```bash
# Cài đặt Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone và setup project

```bash
# Tạo user cho service
sudo useradd -r -s /bin/false nodejs

# Clone project
sudo mkdir -p /opt/rag-google-driver
sudo chown nodejs:nodejs /opt/rag-google-driver
cd /opt/rag-google-driver

# Clone code (hoặc upload files)
# git clone <your-repo> .

# Install dependencies
sudo -u nodejs npm ci --only=production

# Setup .env
sudo -u nodejs cp env.sample .env
sudo -u nodejs nano .env  # Điền thông tin
```

### 3. Setup systemd service

```bash
# Copy service file
sudo cp rag-google-drive.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable rag-google-drive

# Start service
sudo systemctl start rag-google-drive

# Check status
sudo systemctl status rag-google-drive

# View logs
sudo journalctl -u rag-google-drive -f
```

### 4. Quản lý service

```bash
# Restart service
sudo systemctl restart rag-google-drive

# Stop service
sudo systemctl stop rag-google-drive

# View logs
sudo journalctl -u rag-google-drive --since today

# View errors only
sudo journalctl -u rag-google-drive -p err
```

## ☁️ Deploy trên Cloud Platforms

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create rag-google-drive-app

# Set config vars
heroku config:set GOOGLE_CLIENT_ID=your_value
heroku config:set GOOGLE_CLIENT_SECRET=your_value
heroku config:set GOOGLE_REFRESH_TOKEN=your_value
heroku config:set GEMINI_API_KEY=your_value
heroku config:set SUPABASE_URL=your_value
heroku config:set SUPABASE_KEY=your_value
heroku config:set CRON_SCHEDULE="0 2 * * *"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Railway.app

1. Import repository vào Railway
2. Thêm environment variables trong Settings
3. Deploy tự động

### Render.com

1. Create new Background Worker
2. Connect repository
3. Set environment variables
4. Deploy

### DigitalOcean App Platform

1. Create new App from GitHub
2. Choose Worker type
3. Set environment variables
4. Deploy

## 🔄 Cập nhật phiên bản mới

### Docker

```bash
# Pull code mới
git pull

# Rebuild và restart
docker-compose down
docker-compose up -d --build
```

### Linux Server (systemd)

```bash
cd /opt/rag-google-driver

# Pull code mới
sudo -u nodejs git pull

# Install dependencies nếu có thay đổi
sudo -u nodejs npm ci --only=production

# Restart service
sudo systemctl restart rag-google-drive
```

## 📊 Monitoring

### Health Check Endpoint (Optional)

Bạn có thể thêm một HTTP server đơn giản để health check:

```javascript
// Thêm vào index.js
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

server.listen(3000);
```

### Logs

```bash
# Docker
docker logs -f rag-sync

# Systemd
sudo journalctl -u rag-google-drive -f

# PM2 (alternative)
pm2 logs rag-google-drive
```

## 🔐 Security Best Practices

1. **Environment Variables**: Không bao giờ commit `.env` file
2. **User Permissions**: Chạy service với user non-root
3. **Firewall**: Chỉ mở ports cần thiết
4. **Updates**: Thường xuyên cập nhật dependencies
5. **Secrets Management**: Sử dụng secrets manager cho production
6. **Backup**: Backup Supabase database thường xuyên

## 🎯 Production Checklist

- [ ] Environment variables đã được set đầy đủ
- [ ] Supabase database đã được setup (chạy SQL script)
- [ ] Google OAuth đã được config và test
- [ ] Gemini API key đã được verify
- [ ] Cron schedule đã được cấu hình phù hợp
- [ ] Logs được lưu trữ và rotate đúng cách
- [ ] Health checks hoạt động
- [ ] Backup strategy đã được setup
- [ ] Monitoring và alerting đã được cấu hình
- [ ] Error handling và retry logic đã được test

## 🆘 Troubleshooting

### Service không start

```bash
# Check logs
sudo journalctl -u rag-google-drive -n 50

# Check permissions
ls -la /opt/rag-google-driver

# Check environment
sudo systemctl show rag-google-drive --property=Environment
```

### Out of Memory

```bash
# Tăng memory limit cho Docker
# Trong docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Rate Limiting

- Tăng delay giữa các requests trong `src/sync.js`
- Giảm số lượng files process mỗi lần chạy
- Spread out cron schedule

---

Cần hỗ trợ thêm? Tạo issue trên GitHub!


