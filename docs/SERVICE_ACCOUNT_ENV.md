# Sử dụng Service Account với Environment Variables

## Tổng quan

Thay vì sử dụng file `service-account.json`, bạn có thể cấu hình Google Service Account credentials trực tiếp trong environment variables. Phương pháp này an toàn và phù hợp hơn cho môi trường production.

## Lợi ích

✅ **Bảo mật tốt hơn**
- Không cần commit file JSON vào git
- Dễ dàng rotate credentials
- Tương thích với secret managers (AWS Secrets Manager, Google Secret Manager, etc.)

✅ **Deploy dễ dàng**
- Phù hợp với Docker/Kubernetes
- Tích hợp tốt với CI/CD pipelines
- Không cần mount file vào container

✅ **Quản lý tập trung**
- Tất cả config ở một nơi (.env)
- Dễ dàng switch giữa các environments
- Audit trail tốt hơn

## Cách 1: Convert từ JSON file

### Bước 1: Chạy script convert

```bash
node scripts/convert-service-account-to-env.js ./service-account.json
```

### Bước 2: Copy output vào .env

Script sẽ in ra các environment variables. Copy chúng vào file `.env`:

```bash
# Google Service Account (from JSON file)
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=abc123...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=123456789
GOOGLE_SERVICE_ACCOUNT_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_SERVICE_ACCOUNT_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### Bước 3: Comment hoặc xóa dòng GOOGLE_SERVICE_ACCOUNT_FILE

```bash
# GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json  # Không cần nữa
```

### Bước 4: Test

```bash
npm run api
# hoặc
npm run cron
```

### Bước 5: Xóa file JSON (optional)

Sau khi test thành công, bạn có thể xóa file `service-account.json`:

```bash
rm service-account.json
```

## Cách 2: Thêm thủ công

### Lấy thông tin từ Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Vào **IAM & Admin** > **Service Accounts**
3. Chọn service account của bạn
4. Tạo hoặc download JSON key
5. Mở file JSON và copy các giá trị

### Thêm vào .env

```bash
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=<từ JSON: project_id>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=<từ JSON: private_key_id>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="<từ JSON: private_key>"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=<từ JSON: client_email>
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=<từ JSON: client_id>
```

**Lưu ý về PRIVATE_KEY:**
- Phải giữ nguyên format với `\n` cho line breaks
- Phải đặt trong dấu ngoặc kép `"..."`
- Ví dụ: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

## Sử dụng với Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  rag-app:
    build: .
    environment:
      - GOOGLE_SERVICE_ACCOUNT_TYPE=${GOOGLE_SERVICE_ACCOUNT_TYPE}
      - GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=${GOOGLE_SERVICE_ACCOUNT_PROJECT_ID}
      - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
      - GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL}
      - GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=${GOOGLE_SERVICE_ACCOUNT_CLIENT_ID}
      # ... other env vars
```

### Dockerfile

Không cần COPY service-account.json nữa:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# Không cần COPY service-account.json

CMD ["npm", "start"]
```

## Sử dụng với Kubernetes

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: google-service-account
type: Opaque
stringData:
  type: service_account
  project_id: your-project-id
  private_key_id: your-key-id
  private_key: |
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPeJhpg0dCXK9a
    ...
    -----END PRIVATE KEY-----
  client_email: your-sa@project.iam.gserviceaccount.com
  client_id: "123456789"
```

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-app
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-image
        env:
        - name: GOOGLE_SERVICE_ACCOUNT_TYPE
          valueFrom:
            secretKeyRef:
              name: google-service-account
              key: type
        - name: GOOGLE_SERVICE_ACCOUNT_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: google-service-account
              key: project_id
        - name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
          valueFrom:
            secretKeyRef:
              name: google-service-account
              key: private_key
        - name: GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL
          valueFrom:
            secretKeyRef:
              name: google-service-account
              key: client_email
        - name: GOOGLE_SERVICE_ACCOUNT_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: google-service-account
              key: client_id
```

## Sử dụng với AWS Secrets Manager

```javascript
// Example: Load from AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function loadServiceAccount() {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: "google-service-account",
    })
  );
  
  const secret = JSON.parse(response.SecretString);
  
  // Set environment variables
  process.env.GOOGLE_SERVICE_ACCOUNT_TYPE = secret.type;
  process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID = secret.project_id;
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = secret.private_key;
  process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL = secret.client_email;
  process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID = secret.client_id;
}
```

## Troubleshooting

### Lỗi: "private_key must be a string"

**Nguyên nhân:** Private key không đúng format

**Giải pháp:**
- Đảm bảo private key có dấu ngoặc kép
- Giữ nguyên `\n` trong string
- Ví dụ: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."`

### Lỗi: "invalid_grant"

**Nguyên nhân:** Service account không có quyền truy cập

**Giải pháp:**
- Share Google Drive folder với service account email
- Kiểm tra service account có enable Google Drive API
- Verify client_email đúng

### Lỗi: "No valid authentication method configured"

**Nguyên nhân:** Thiếu một số environment variables bắt buộc

**Giải pháp:**
- Kiểm tra có đủ các biến: `type`, `private_key`, `client_email`
- Chạy script convert lại để đảm bảo đầy đủ

### Test kết nối

```bash
# Test với Node.js
node -e "import('./src/services/googleDrive.js').then(m => m.default.initialize().then(() => console.log('✅ Connected')))"
```

## Best Practices

1. **Không commit credentials vào git**
   - Luôn dùng `.env` và add vào `.gitignore`
   - Sử dụng `.env.sample` làm template

2. **Rotate credentials định kỳ**
   - Tạo service account key mới mỗi 90 ngày
   - Xóa key cũ sau khi deploy key mới

3. **Sử dụng secret managers cho production**
   - AWS Secrets Manager
   - Google Secret Manager
   - HashiCorp Vault
   - Azure Key Vault

4. **Giới hạn quyền của service account**
   - Chỉ cấp quyền read-only cho Drive
   - Không dùng service account có quyền admin

5. **Monitor và audit**
   - Enable audit logs cho service account
   - Monitor API usage
   - Set up alerts cho unusual activity

## Tham khảo

- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Best practices for managing service account keys](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)
- [Environment Variables Best Practices](https://12factor.net/config)
