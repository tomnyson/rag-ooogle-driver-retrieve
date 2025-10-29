# Quick Reference - Service Account Configuration

## 🚀 Chuyển từ JSON file sang Environment Variables

### Bước 1: Convert
```bash
npm run convert-sa
# hoặc
node scripts/convert-service-account-to-env.js service-account.json
```

### Bước 2: Copy output vào .env
```bash
# Comment dòng này
# GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Paste output từ script
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=...
```

### Bước 3: Test
```bash
npm run api
# hoặc
npm run cron
```

### Bước 4: Xóa JSON file (optional)
```bash
rm service-account.json
```

## 📋 So sánh hai phương pháp

| Feature | JSON File | Environment Variables |
|---------|-----------|----------------------|
| **Setup** | ✅ Dễ dàng | ⚠️ Cần convert |
| **Security** | ⚠️ Có thể bị commit nhầm | ✅ An toàn hơn |
| **Docker** | ⚠️ Cần mount file | ✅ Dễ dàng |
| **CI/CD** | ⚠️ Cần manage file | ✅ Tích hợp tốt |
| **Secret Manager** | ❌ Khó | ✅ Dễ dàng |
| **Rotation** | ⚠️ Phải update file | ✅ Chỉ update env |

## 🔧 Commands

```bash
# Convert JSON to env vars
npm run convert-sa

# Test connection
node -e "import('./src/services/googleDrive.js').then(m => m.default.initialize())"

# Start services
npm start
npm run api
npm run cron
```

## 🐳 Docker Example

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - GOOGLE_SERVICE_ACCOUNT_TYPE=${GOOGLE_SERVICE_ACCOUNT_TYPE}
      - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
      - GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL}
```

## 📖 Full Documentation

Xem [docs/SERVICE_ACCOUNT_ENV.md](docs/SERVICE_ACCOUNT_ENV.md) để biết chi tiết.
