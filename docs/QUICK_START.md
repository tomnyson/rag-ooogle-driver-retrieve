# 🚀 Quick Start - Clean & Simple

Code đã được refactor để clean và tách biệt rõ ràng!

## 📦 Two Separate Servers

### 1. ⏰ Cron Job Server (`cron-server.js`)
Sync Google Drive → Supabase theo lịch hoặc manual.

```bash
# Run với cron schedule (tự động theo CRON_SCHEDULE)
npm run cron

# Run một lần và exit
npm run cron:once

# Development mode (auto-reload)
npm run cron:dev
```

### 2. 🌐 API Server (`api-server.js`)
REST API để query RAG system.

```bash
# Run API server (port 3000)
npm run api

# Run trên port khác
npm run api:8080

# Development mode (auto-reload)
npm run api:dev
```

## 🎯 Common Tasks

### Setup lần đầu

```bash
# 1. Install dependencies
npm install

# 2. Setup .env file
cp env.sample .env
# Edit .env với credentials của bạn

# 3. Verify config
npm run check

# 4. Test sync (một lần)
npm run cron:once

# 5. Start API server
npm run api
```

### Production Deployment

```bash
# Terminal 1: API Server
npm run api

# Terminal 2: Cron Job
npm run cron
```

Hoặc với PM2:

```bash
pm2 start api-server.js --name rag-api
pm2 start cron-server.js --name rag-cron
pm2 save
```

## 📋 All Commands

| Command | Description |
|---------|-------------|
| `npm run cron` | Start cron scheduler |
| `npm run cron:once` | Run sync once |
| `npm run cron:dev` | Dev mode (cron) |
| `npm run api` | Start API server |
| `npm run api:8080` | API on port 8080 |
| `npm run api:dev` | Dev mode (API) |
| `npm run check` | Verify configuration |
| `npm run test:list` | Test file listing |
| `npm run test:vector` | Test vector processing |

## 🔧 Configuration

File `.env`:

```env
# Google Drive (Service Account)
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json

# Gemini API
GEMINI_API_KEY=your_key

# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_key

# Cron Schedule
CRON_SCHEDULE=0 2 * * *        # 2 AM daily
CRON_RUN_ON_STARTUP=true       # Run sync on startup

# API Server
API_PORT=3000                   # Default port

# Optional
DRIVE_FOLDER_ID=your_folder_id
TEACHER_ID=
USER_ID=
```

## 🧪 Testing

### Test Sync
```bash
npm run cron:once
```

### Test API
```bash
# Start API
npm run api

# In another terminal
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'
```

### Test Vector Processing
```bash
npm run test:vector
```

## 🐛 Troubleshooting

### Port already in use
```bash
npm run api:kill
# or
./kill-port.sh 3000
```

### Check config
```bash
npm run check
```

### View logs
Cron và API đều log ra console. Check terminal output.

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API endpoints
- [REFACTORING.md](REFACTORING.md) - Refactoring details

---

**Ready?** Run `npm run cron:once` to sync, then `npm run api` to start API! 🎉

