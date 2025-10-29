# Project Notes

## ES Modules Configuration

Project này sử dụng ES modules (`"type": "module"` trong package.json).

### Important Files

#### CommonJS Files (`.cjs`)
- `ecosystem.config.cjs` - PM2 configuration (phải dùng .cjs vì PM2 require CommonJS)

#### ES Module Files (`.js`)
- Tất cả các files khác trong project
- `api-server.js`
- `cron-server.js`
- `src/**/*.js`
- `scripts/**/*.js`

### Why ecosystem.config.cjs?

PM2 sử dụng `require()` để load config file, nên cần CommonJS format. Khi project có `"type": "module"`, file `.js` sẽ được treat như ES module và gây lỗi:

```
ReferenceError: module is not defined in ES module scope
```

**Solution:** Đổi tên thành `.cjs` để PM2 biết đây là CommonJS file.

### File Extensions

```
.js   → ES Module (import/export)
.cjs  → CommonJS (require/module.exports)
.mjs  → ES Module (explicit)
```

## PM2 Commands

```bash
# Start services
npm run pm2:start
pm2 start ecosystem.config.cjs

# Status
npm run pm2:status

# Logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

## Environment Variables

### Option 1: JSON File (Development)
```bash
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
```

### Option 2: Env Vars (Production)
```bash
GOOGLE_SERVICE_ACCOUNT_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=...
```

Convert từ JSON sang env vars:
```bash
npm run convert-sa
```

## Deployment

### Development
```bash
npm run api
npm run cron
```

### Production
```bash
# Quick start
./scripts/pm2-quick-start.sh

# Or manual
npm install -g pm2
npm run pm2:start
pm2 save
pm2 startup
```

## Logs Location

```
logs/
├── api-error.log
├── api-out.log
├── cron-error.log
└── cron-out.log
```

## Troubleshooting

### PM2 config error
```bash
# Validate config
node -e "const config = require('./ecosystem.config.cjs'); console.log(config)"
```

### Port already in use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Service not starting
```bash
# Check logs
pm2 logs --err

# Check .env
cat .env

# Restart with update-env
pm2 restart ecosystem.config.cjs --update-env
```

## Documentation

- [README.md](README.md) - Main documentation
- [PM2_GUIDE.md](PM2_GUIDE.md) - Complete PM2 guide
- [PM2_CHEATSHEET.md](PM2_CHEATSHEET.md) - Quick reference
- [docs/SERVICE_ACCOUNT_ENV.md](docs/SERVICE_ACCOUNT_ENV.md) - Service Account setup
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference

## Git

Files to ignore:
- `.env` - Contains secrets
- `service-account.json` - Contains credentials
- `node_modules/` - Dependencies
- `logs/` - Log files

Already configured in `.gitignore`.
