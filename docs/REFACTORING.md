# 🔧 Code Refactoring Summary

Code đã được refactor để clean và tách biệt rõ ràng giữa API server và cron job.

## 📁 New Structure

### Core Services (không đổi)
- `src/services/` - All service modules
- `src/config/` - Configuration
- `src/sync.js` - Sync logic

### Entry Points (đã refactor)

#### 1. **Cron Server** (`cron-server.js`) ⏰
- Chạy scheduled sync jobs
- Standalone, không có API

```bash
# Run with cron schedule
npm run cron

# Run once and exit
npm run cron:once

# Development mode
npm run cron:dev
```

#### 2. **API Server** (`api-server.js`) 🌐
- REST API endpoints
- Standalone, không có cron

```bash
# Run API server
npm run api

# Run on specific port
npm run api:8080

# Development mode
npm run api:dev
```

## 🗑️ Removed/Deprecated

### Old Files (deprecated)
- ~~`index.js`~~ → Replaced by `cron-server.js`
- Old scripts trong package.json

### Unused Utilities (giữ lại cho reference)
- `setup-oauth.js` - Chỉ cần nếu dùng OAuth (hiện tại dùng Service Account)
- `search-example.js` - Example script (giữ lại cho documentation)

## 📦 Clean Package.json Scripts

### Before
```json
{
  "start": "node index.js",
  "start:once": "node index.js once",
  "api": "...",
  "api:8080": "...",
  ...
}
```

### After
```json
{
  "cron": "node cron-server.js",      // Clear: Cron job
  "cron:once": "node cron-server.js once",
  "api": "node api-server.js",        // Clear: API server
  "api:8080": "API_PORT=8080 node api-server.js",
  ...
}
```

## 🚀 Usage

### Run Cron Job Only

```bash
# Scheduled cron (runs according to CRON_SCHEDULE)
npm run cron

# Run once manually
npm run cron:once
```

### Run API Server Only

```bash
# Default port 3000
npm run api

# Custom port
npm run api:8080

# Or with env var
API_PORT=5000 npm run api
```

### Run Both (Production)

```bash
# Terminal 1: API Server
npm run api

# Terminal 2: Cron Job
npm run cron
```

Hoặc dùng PM2:

```bash
pm2 start api-server.js --name rag-api
pm2 start cron-server.js --name rag-cron
pm2 save
```

## 🧹 Code Cleanup

### 1. Removed Duplication
- ✅ No shared code between API and Cron
- ✅ Each has its own entry point
- ✅ Clear separation of concerns

### 2. Simplified Logic
- ✅ Cron server: Only sync logic
- ✅ API server: Only API endpoints
- ✅ No mixed responsibilities

### 3. Better Naming
- ✅ `cron-server.js` - Clear purpose
- ✅ `api-server.js` - Clear purpose
- ✅ Scripts names are self-explanatory

## 📊 Architecture

```
┌─────────────────┐
│  cron-server.js │  → Sync Google Drive → Supabase
└─────────────────┘     (Scheduled/Manual)

┌─────────────────┐
│  api-server.js  │  → REST API for queries
└─────────────────┘     (Always running)

         ↓                ↓
    ┌─────────────────────────┐
    │   Shared Services       │
    │  - googleDrive.js       │
    │  - gemini.js            │
    │  - supabase.js          │
    │  - rag.js               │
    │  - sync.js              │
    └─────────────────────────┘
```

## 🔄 Migration Guide

### Old Way
```bash
npm start          # Cron job
npm start once     # Sync once
npm run api        # API
```

### New Way
```bash
npm run cron       # Cron job
npm run cron:once  # Sync once
npm run api        # API (same)
```

## ✅ Benefits

1. **Clear Separation**: API và Cron hoàn toàn độc lập
2. **Easy Deployment**: Deploy riêng biệt
3. **Better Scaling**: Scale API và Cron riêng
4. **Cleaner Code**: Không có mixing logic
5. **Easier Testing**: Test riêng từng service

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Run cron job | `npm run cron` |
| Sync once | `npm run cron:once` |
| Start API | `npm run api` |
| API on port 8080 | `npm run api:8080` |
| Dev mode (cron) | `npm run cron:dev` |
| Dev mode (API) | `npm run api:dev` |
| Check config | `npm run check` |
| Kill port | `npm run api:kill` |

---

**Status**: ✅ Refactored and Clean  
**Next**: Deploy both services separately in production

