# Scripts Directory

Các utility scripts để quản lý và deploy ứng dụng.

## 📜 Available Scripts

### 1. convert-service-account-to-env.js

Convert Google Service Account JSON file sang environment variables.

**Usage:**
```bash
# Sử dụng npm script
npm run convert-sa

# Hoặc chạy trực tiếp
node scripts/convert-service-account-to-env.js [path-to-json]

# Examples
node scripts/convert-service-account-to-env.js ./service-account.json
node scripts/convert-service-account-to-env.js ~/Downloads/my-sa.json
```

**Output:**
```bash
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
# ... more variables
```

Copy output vào file `.env`.

---

### 2. pm2-setup.sh

Interactive script để setup và quản lý PM2.

**Usage:**
```bash
./scripts/pm2-setup.sh
```

**Features:**
- Start/Stop/Restart services
- View status and logs
- Setup PM2 startup (auto-start on boot)
- Interactive menu

**Menu Options:**
1. Start services
2. Stop services
3. Restart services
4. View status
5. View logs
6. Setup PM2 startup
7. Exit

---

### 3. pm2-quick-start.sh

One-command setup cho production deployment với PM2.

**Usage:**
```bash
./scripts/pm2-quick-start.sh
```

**What it does:**
1. ✅ Check Node.js, npm, PM2
2. ✅ Install PM2 nếu chưa có
3. ✅ Create .env từ .env.sample
4. ✅ Install dependencies
5. ✅ Create logs directory
6. ✅ Start services với PM2
7. ✅ Optional: Setup auto-start on boot

**Perfect for:**
- First-time deployment
- Quick production setup
- Automated deployment scripts

---

## 🚀 Quick Start Guide

### Development

```bash
# Just run the app
npm run api
npm run cron
```

### Production

```bash
# Option 1: Quick start (recommended for first time)
./scripts/pm2-quick-start.sh

# Option 2: Manual setup
npm install -g pm2
npm install --production
cp .env.sample .env
# Edit .env
npm run pm2:start

# Option 3: Interactive setup
./scripts/pm2-setup.sh
```

## 📋 Common Tasks

### Convert Service Account

```bash
# Convert JSON to env vars
npm run convert-sa

# Or with custom path
node scripts/convert-service-account-to-env.js ~/my-sa.json
```

### Start Services

```bash
# With npm scripts
npm run pm2:start

# Or with script
./scripts/pm2-quick-start.sh
```

### Manage Services

```bash
# Interactive management
./scripts/pm2-setup.sh

# Or use npm scripts
npm run pm2:status
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

## 🔧 Script Permissions

Make scripts executable:

```bash
chmod +x scripts/*.sh
```

## 📝 Adding New Scripts

When adding new scripts:

1. Create script file in `scripts/` directory
2. Add shebang line: `#!/bin/bash` or `#!/usr/bin/env node`
3. Make executable: `chmod +x scripts/your-script.sh`
4. Add npm script in `package.json` if needed
5. Document in this README

## 🐛 Troubleshooting

### Permission Denied

```bash
chmod +x scripts/script-name.sh
```

### PM2 Not Found

```bash
npm install -g pm2
```

### .env Not Found

```bash
cp .env.sample .env
# Edit .env with your credentials
```

## 📚 Related Documentation

- [PM2_GUIDE.md](../PM2_GUIDE.md) - Full PM2 documentation
- [docs/SERVICE_ACCOUNT_ENV.md](../docs/SERVICE_ACCOUNT_ENV.md) - Service Account setup
- [README.md](../README.md) - Main documentation
