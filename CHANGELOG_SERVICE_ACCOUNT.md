# Changelog - Service Account Environment Variables Support

## Tổng quan thay đổi

Đã thêm hỗ trợ sử dụng Google Service Account credentials thông qua environment variables thay vì file JSON, giúp deploy production an toàn và dễ dàng hơn.

## ✨ Tính năng mới

### 1. Hỗ trợ Environment Variables
- Có thể cấu hình Service Account credentials trực tiếp trong `.env`
- Không cần file `service-account.json` nữa
- Tương thích ngược 100% - vẫn hỗ trợ file JSON

### 2. Script Convert
- **File mới:** `scripts/convert-service-account-to-env.js`
- **Command:** `npm run convert-sa`
- Tự động convert từ JSON file sang environment variables
- Output sẵn sàng để copy vào `.env`

### 3. Documentation
- **File mới:** `docs/SERVICE_ACCOUNT_ENV.md` - Hướng dẫn chi tiết
- **File mới:** `QUICK_REFERENCE.md` - Quick reference guide
- **File mới:** `.env.example` - Template với cả hai options
- **Cập nhật:** `README.md` - Thêm hướng dẫn sử dụng

## 📝 Files đã thay đổi

### Code Changes

#### `src/config/index.js`
```javascript
// Thêm config cho service account từ env vars
serviceAccountEnv: {
  type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE || null,
  project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID || null,
  private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID || null,
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? 
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || null,
  // ... other fields
}
```

#### `src/services/googleDrive.js`
```javascript
// Hỗ trợ cả file JSON và env vars
async initialize() {
  // Option 1: From file
  if (config.google.serviceAccountFile) { ... }
  
  // Option 2: From env vars
  else if (config.google.serviceAccountEnv.type && ...) { ... }
  
  // Option 3: OAuth2 fallback
  else if (config.google.clientId && ...) { ... }
}
```

### Configuration Changes

#### `.env.sample`
```bash
# Option 1: File (traditional)
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Option 2: Env vars (production)
# GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
# GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."
# GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
```

#### `package.json`
```json
{
  "scripts": {
    "convert-sa": "node scripts/convert-service-account-to-env.js"
  }
}
```

## 🎯 Use Cases

### Development
```bash
# Dùng file JSON - đơn giản
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
```

### Production
```bash
# Dùng env vars - an toàn
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=sa@project.iam.gserviceaccount.com
```

### Docker
```yaml
# docker-compose.yml
environment:
  - GOOGLE_SERVICE_ACCOUNT_TYPE=${GOOGLE_SERVICE_ACCOUNT_TYPE}
  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
  - GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL}
```

### Kubernetes
```yaml
# Use secrets
env:
  - name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    valueFrom:
      secretKeyRef:
        name: google-sa
        key: private_key
```

## 🔄 Migration Guide

### Từ JSON file sang Env Vars

1. **Convert**
   ```bash
   npm run convert-sa
   ```

2. **Update .env**
   ```bash
   # Comment dòng cũ
   # GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
   
   # Paste output từ script
   GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
   # ... other vars
   ```

3. **Test**
   ```bash
   npm run api
   ```

4. **Cleanup** (optional)
   ```bash
   rm service-account.json
   ```

## ✅ Benefits

### Security
- ✅ Không cần commit file JSON vào git
- ✅ Dễ dàng rotate credentials
- ✅ Tương thích với secret managers

### DevOps
- ✅ Dễ dàng deploy với Docker/Kubernetes
- ✅ Tích hợp tốt với CI/CD
- ✅ Không cần mount files vào containers

### Management
- ✅ Tất cả config ở một nơi (.env)
- ✅ Dễ dàng switch giữa environments
- ✅ Audit trail tốt hơn

## 🔒 Security Best Practices

1. **Không commit credentials**
   - `.gitignore` đã có `service-account.json`
   - `.gitignore` đã có `.env`

2. **Sử dụng secret managers**
   - AWS Secrets Manager
   - Google Secret Manager
   - HashiCorp Vault

3. **Rotate credentials định kỳ**
   - Tạo key mới mỗi 90 ngày
   - Xóa key cũ sau khi deploy

4. **Giới hạn quyền**
   - Chỉ cấp quyền read-only
   - Không dùng admin service account

## 📊 Compatibility

- ✅ **Backward Compatible:** Vẫn hỗ trợ file JSON
- ✅ **Node.js:** 18+
- ✅ **Docker:** All versions
- ✅ **Kubernetes:** All versions
- ✅ **CI/CD:** GitHub Actions, GitLab CI, Jenkins, etc.

## 🧪 Testing

```bash
# Test với file JSON
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json npm run api

# Test với env vars
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account \
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..." \
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL="..." \
npm run api
```

## 📚 Documentation

- [docs/SERVICE_ACCOUNT_ENV.md](docs/SERVICE_ACCOUNT_ENV.md) - Chi tiết đầy đủ
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference
- [README.md](README.md) - Updated với hướng dẫn mới

## 🙏 Credits

Feature này được implement để:
- Tăng security cho production deployments
- Dễ dàng integrate với modern DevOps practices
- Tương thích với cloud-native architectures

---

**Version:** 1.1.0  
**Date:** 2025-10-29  
**Author:** Development Team
