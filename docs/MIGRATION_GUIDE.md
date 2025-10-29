# Migration Guide

## Nếu bạn đang dùng ecosystem.config.js

Nếu bạn đã có file `ecosystem.config.js` từ trước, cần đổi tên thành `.cjs`:

### Quick Fix

```bash
# Đổi tên file
mv ecosystem.config.js ecosystem.config.cjs

# Update package.json scripts (đã được update tự động)
# Không cần làm gì thêm
```

### Why?

Project này sử dụng ES modules (`"type": "module"` trong package.json). PM2 sử dụng `require()` để load config, nên cần CommonJS format.

**Error bạn sẽ gặp nếu dùng .js:**
```
ReferenceError: module is not defined in ES module scope
```

**Solution:** Dùng `.cjs` extension để PM2 biết đây là CommonJS file.

### Verify

```bash
# Test config file
node -e "const config = require('./ecosystem.config.cjs'); console.log('✅ Valid')"

# Start PM2
npm run pm2:start
```

## Nếu bạn đang dùng service-account.json

### Option 1: Tiếp tục dùng JSON file (Development)

Không cần thay đổi gì, chỉ cần:

```bash
# .env
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
```

### Option 2: Chuyển sang Environment Variables (Production)

**Bước 1: Convert**
```bash
npm run convert-sa
```

**Bước 2: Copy output vào .env**
```bash
# Comment dòng cũ
# GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Paste output từ script
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
# ... other vars
```

**Bước 3: Test**
```bash
npm run api
# hoặc
npm run cron
```

**Bước 4: Cleanup (optional)**
```bash
rm service-account.json
```

## Nếu bạn đang chạy trực tiếp với node

### Trước đây

```bash
node api-server.js &
node cron-server.js &
```

### Bây giờ với PM2

```bash
# Quick start
./scripts/pm2-quick-start.sh

# Or manual
npm install -g pm2
npm run pm2:start
```

### Benefits

- ✅ Auto-restart on crash
- ✅ Log management
- ✅ Process monitoring
- ✅ Zero-downtime reload
- ✅ Startup script (auto-start on boot)

## Nếu bạn đang dùng systemd

Bạn có thể:

### Option 1: Tiếp tục dùng systemd

Không cần thay đổi gì.

### Option 2: Chuyển sang PM2

**Advantages:**
- Dễ quản lý hơn
- Better monitoring
- Easier deployment
- Cross-platform

**Steps:**

1. Stop systemd service
```bash
sudo systemctl stop rag-google-drive
sudo systemctl disable rag-google-drive
```

2. Start with PM2
```bash
npm run pm2:start
pm2 save
pm2 startup
```

3. Run suggested command
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

## Nếu bạn đang dùng Docker

### Update docker-compose.yml

Không cần thay đổi gì, nhưng nếu bạn muốn dùng env vars thay vì mount service-account.json:

```yaml
services:
  app:
    environment:
      # Thay vì mount file
      # - ./service-account.json:/app/service-account.json
      
      # Dùng env vars
      - GOOGLE_SERVICE_ACCOUNT_TYPE=${GOOGLE_SERVICE_ACCOUNT_TYPE}
      - GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=${GOOGLE_SERVICE_ACCOUNT_PROJECT_ID}
      - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
      - GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL}
      - GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=${GOOGLE_SERVICE_ACCOUNT_CLIENT_ID}
```

## Checklist

### Development

- [ ] Đổi tên `ecosystem.config.js` → `ecosystem.config.cjs` (nếu có)
- [ ] File `.env` đã được cấu hình
- [ ] Dependencies đã được install (`npm install`)
- [ ] Test chạy: `npm run api` hoặc `npm run cron`

### Production

- [ ] PM2 đã được install globally (`npm install -g pm2`)
- [ ] Đổi tên `ecosystem.config.js` → `ecosystem.config.cjs` (nếu có)
- [ ] File `.env` đã được cấu hình với production credentials
- [ ] (Optional) Convert service-account.json sang env vars
- [ ] Dependencies đã được install (`npm install --production`)
- [ ] Logs directory đã được tạo (`mkdir -p logs`)
- [ ] Start services: `npm run pm2:start`
- [ ] Setup auto-start: `pm2 startup && pm2 save`
- [ ] Verify: `npm run pm2:status`

## Rollback

Nếu có vấn đề, bạn có thể rollback:

### Rollback PM2 → Direct Node

```bash
# Stop PM2
npm run pm2:stop
pm2 delete all

# Run directly
npm run api &
npm run cron &
```

### Rollback Env Vars → JSON File

```bash
# Restore service-account.json (from backup)
# Update .env
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Comment out env vars
# GOOGLE_SERVICE_ACCOUNT_TYPE=...
# GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
# ...

# Restart
npm run pm2:restart
```

## Support

Nếu gặp vấn đề:

1. Check logs: `npm run pm2:logs`
2. Check status: `npm run pm2:status`
3. Check config: `node -e "const c = require('./ecosystem.config.cjs'); console.log(c)"`
4. Check .env: `cat .env | grep -v "PRIVATE_KEY"`
5. See [PM2_GUIDE.md](PM2_GUIDE.md) for troubleshooting

## Questions?

- **Q: Tại sao phải dùng .cjs?**
  - A: Vì project dùng ES modules nhưng PM2 cần CommonJS format

- **Q: Có bắt buộc phải dùng PM2 không?**
  - A: Không, bạn vẫn có thể chạy trực tiếp với `node` hoặc dùng systemd/Docker

- **Q: Có bắt buộc phải convert sang env vars không?**
  - A: Không, nhưng recommended cho production vì an toàn hơn

- **Q: PM2 có free không?**
  - A: Có, PM2 hoàn toàn free và open source

- **Q: Có thể dùng cả JSON file và env vars không?**
  - A: Có, code sẽ ưu tiên JSON file trước, nếu không có mới dùng env vars
