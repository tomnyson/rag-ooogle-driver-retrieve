# RAG Google Drive

Node.js application to sync Google Drive files to Supabase vector storage with Gemini embeddings for RAG (Retrieval-Augmented Generation).

## 🚀 Quick Start

### Môi trường Development

```bash
# 1. Cài đặt dependencies
npm install
# hoặc
yarn install

# 2. Cấu hình môi trường
cp .env.sample .env
# Chỉnh sửa file .env với thông tin của bạn

# 3. Chạy API server (development mode)
npm run api
# hoặc
node api-server.js

# 4. Chạy cron job (development mode)
npm run cron
# hoặc
node cron-server.js

# 5. Chạy cả hai services cùng lúc
npm start
```

### Môi trường Production

#### Option 1: Chạy trực tiếp với Node.js

```bash
# 1. Cài đặt dependencies (production only)
npm install --production
# hoặc
yarn install --production

# 2. Cấu hình môi trường production
cp .env.sample .env
# Chỉnh sửa .env với thông tin production

# 3. Chạy với PM2 (recommended)
npm install -g pm2

# Chạy API server
pm2 start api-server.js --name "rag-api"

# Chạy cron job
pm2 start cron-server.js --name "rag-cron"

# Xem logs
pm2 logs

# Khởi động lại
pm2 restart all

# Dừng services
pm2 stop all
```

#### Option 2: Chạy với Docker

```bash
# 1. Build và chạy với Docker Compose
cd deployment
docker-compose up -d

# 2. Xem logs
docker-compose logs -f

# 3. Dừng services
docker-compose down

# 4. Rebuild sau khi có thay đổi
docker-compose up -d --build
```

#### Option 3: Chạy với systemd (Linux)

```bash
# 1. Copy service file
sudo cp deployment/rag-google-drive.service /etc/systemd/system/

# 2. Chỉnh sửa đường dẫn trong service file
sudo nano /etc/systemd/system/rag-google-drive.service

# 3. Enable và start service
sudo systemctl enable rag-google-drive
sudo systemctl start rag-google-drive

# 4. Kiểm tra status
sudo systemctl status rag-google-drive

# 5. Xem logs
sudo journalctl -u rag-google-drive -f
```

## 📦 Commands

### Main Services
```bash
npm run cron        # Chạy scheduled sync (cron job)
npm run api         # Chạy API server (port 3000)
npm start           # Chạy cả API và cron cùng lúc
```

### Environment Variables

Tạo file `.env` từ `.env.sample` và cấu hình các biến sau:

```bash
# Google Drive API (Service Account)
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Cron Schedule (mặc định: 2 giờ sáng mỗi ngày)
CRON_SCHEDULE=0 2 * * *

# Google Drive Folder ID (optional)
DRIVE_FOLDER_ID=your_folder_id

# Teacher ID và User ID (optional)
TEACHER_ID=
USER_ID=

# API Server Port
API_PORT=3000
```

## 📁 Project Structure

```
rag-google-driver/
├── api-server.js      # API server entry point
├── cron-server.js     # Cron job entry point
├── src/               # Source code
│   ├── services/      # Business logic
│   ├── utils/         # Utilities (logger, errors, validators)
│   └── config/        # Configuration
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── examples/          # Usage examples
├── database/          # Database setup SQL
└── deployment/        # Docker & systemd configs
```

## 📚 Documentation

All documentation is in the `docs/` folder:

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get started quickly
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[Service Account with Env Vars](docs/SERVICE_ACCOUNT_ENV.md)** - Using environment variables instead of JSON file
- **[Incremental Sync](docs/INCREMENTAL_SYNC.md)** - How change detection works
- **[API Documentation](docs/API_DOCUMENTATION.md)** - API endpoints
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment
- **[Refactoring](docs/REFACTORING_IMPLEMENTATION.md)** - Code refactoring details

## 🔧 Requirements

- Node.js 18+ 
- Google Cloud Service Account (for Drive access)
- Google Gemini API key
- Supabase account

## 📊 Features

- ✅ **Incremental sync** - Only processes new/modified files
- ✅ Automatic Google Drive file sync
- ✅ Text extraction (PDF, Word, Google Docs)
- ✅ Vector embeddings with Gemini AI
- ✅ Semantic search with cosine similarity
- ✅ REST API for queries
- ✅ Scheduled cron jobs
- ✅ Docker support

## 🛠️ Setup Chi Tiết

### 1. Cài đặt Dependencies

```bash
# Sử dụng npm
npm install

# Hoặc yarn
yarn install
```

### 2. Cấu hình Google Service Account

#### Option A: Sử dụng JSON File (Development)

1. Tạo Service Account trên Google Cloud Console
2. Enable Google Drive API
3. Download file JSON credentials
4. Đặt file vào thư mục gốc với tên `service-account.json`
5. Share Google Drive folder với email của Service Account
6. Trong `.env`: `GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json`

#### Option B: Sử dụng Environment Variables (Production/Docker)

**Cách 1: Convert từ JSON file**

```bash
# Chạy script convert
node scripts/convert-service-account-to-env.js ./service-account.json

# Copy output vào .env file
# Sau đó có thể xóa service-account.json
```

**Cách 2: Thêm thủ công vào .env**

```bash
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=your-key-id
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=your-client-id
```

**Lợi ích của Environment Variables:**
- ✅ An toàn hơn cho production (không cần commit file JSON)
- ✅ Dễ dàng deploy với Docker/Kubernetes
- ✅ Tương thích với CI/CD pipelines
- ✅ Quản lý secrets tốt hơn với secret managers

Chi tiết: [docs/SERVICE_ACCOUNT_SETUP.md](docs/SERVICE_ACCOUNT_SETUP.md)

### 3. Cấu hình Supabase

1. Tạo project trên Supabase
2. Chạy SQL script trong `database/` để tạo tables
3. Copy URL và API key vào `.env`

### 4. Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy vào `.env`

Xem thêm: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## 🐳 Docker Deployment

### Development với Docker

```bash
# Build và chạy
cd deployment
docker-compose up

# Chạy ở background
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### Production với Docker

```bash
# 1. Cấu hình .env file
cp .env.sample .env
# Chỉnh sửa với thông tin production

# 2. Build và deploy
cd deployment
docker-compose -f docker-compose.yml up -d

# 3. Monitor logs
docker-compose logs -f

# 4. Restart services
docker-compose restart

# 5. Stop services
docker-compose down

# 6. Update và rebuild
git pull
docker-compose up -d --build
```

### Docker Commands Hữu Ích

```bash
# Xem container đang chạy
docker ps

# Vào container shell
docker exec -it rag-google-drive sh

# Xem logs của container cụ thể
docker logs -f rag-google-drive

# Xóa và rebuild hoàn toàn
docker-compose down -v
docker-compose up -d --build
```

## � Testing & Debugging

### Kiểm tra kết nối

```bash
# Test Google Drive access
node -e "import('./src/services/googleDrive.js').then(m => m.default.listFiles().then(console.log))"

# Test Supabase connection
node -e "import('./src/services/supabase.js').then(m => m.default.testConnection())"
```

### API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Search documents
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "limit": 5}'

# Trigger manual sync
curl -X POST http://localhost:3000/api/sync
```

## 🚨 Troubleshooting

### Lỗi thường gặp

**1. Google Drive API Error**
- Kiểm tra Service Account có quyền truy cập folder
- Verify `service-account.json` đúng format
- Enable Google Drive API trên Cloud Console

**2. Supabase Connection Error**
- Kiểm tra SUPABASE_URL và SUPABASE_KEY
- Verify network connection
- Check Supabase project status

**3. Gemini API Error**
- Verify GEMINI_API_KEY còn hiệu lực
- Check API quota limits
- Ensure billing is enabled

## 📊 Monitoring Production

### PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Logs
pm2 logs rag-api
pm2 logs rag-cron

# Status
pm2 status

# Restart on errors
pm2 restart all
```

### Docker Monitoring

```bash
# Container stats
docker stats

# Logs
docker-compose logs -f --tail=100

# Health check
docker ps
```

## 📝 License

MIT

---

For more details, check the [documentation](docs/).
