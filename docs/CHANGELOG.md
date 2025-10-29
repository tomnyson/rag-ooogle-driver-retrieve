# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-29

### Added - PM2 Support

#### Configuration Files
- ✅ `ecosystem.config.cjs` - PM2 configuration for API and Cron services
- ✅ 8 new npm scripts for PM2 management

#### Scripts
- ✅ `scripts/pm2-setup.sh` - Interactive PM2 management tool
- ✅ `scripts/pm2-quick-start.sh` - One-command production deployment
- ✅ `scripts/README.md` - Scripts documentation

#### Documentation
- ✅ `PM2_GUIDE.md` - Complete PM2 deployment guide (36KB)
- ✅ `PM2_CHEATSHEET.md` - Quick command reference
- ✅ `PM2_SETUP_SUMMARY.md` - Setup summary and checklist
- ✅ `MIGRATION_GUIDE.md` - Migration guide from old setup
- ✅ `NOTES.md` - Project notes and troubleshooting

#### NPM Scripts
```json
{
  "pm2:start": "pm2 start ecosystem.config.cjs",
  "pm2:stop": "pm2 stop ecosystem.config.cjs",
  "pm2:restart": "pm2 restart ecosystem.config.cjs",
  "pm2:reload": "pm2 reload ecosystem.config.cjs",
  "pm2:delete": "pm2 delete ecosystem.config.cjs",
  "pm2:logs": "pm2 logs",
  "pm2:monit": "pm2 monit",
  "pm2:status": "pm2 status"
}
```

#### Features
- ✅ Auto-restart on crash
- ✅ Log management (separate error and output logs)
- ✅ Process monitoring
- ✅ Zero-downtime reload
- ✅ Memory limit management (500MB default)
- ✅ Startup script support (auto-start on boot)

### Added - Service Account Environment Variables Support

#### Configuration
- ✅ Support for Google Service Account credentials via environment variables
- ✅ Backward compatible with JSON file method
- ✅ Updated `.env.sample` with both options
- ✅ New `.env.example` with detailed comments

#### Scripts
- ✅ `scripts/convert-service-account-to-env.js` - Convert JSON to env vars
- ✅ `npm run convert-sa` - NPM script for conversion

#### Code Changes
- ✅ `src/config/index.js` - Added env vars support
- ✅ `src/services/googleDrive.js` - Support both JSON file and env vars

#### Documentation
- ✅ `docs/SERVICE_ACCOUNT_ENV.md` - Complete guide for env vars setup
- ✅ `QUICK_REFERENCE.md` - Quick reference guide
- ✅ `CHANGELOG_SERVICE_ACCOUNT.md` - Detailed changelog

#### Benefits
- ✅ More secure for production (no JSON file to commit)
- ✅ Better for Docker/Kubernetes deployments
- ✅ Compatible with CI/CD pipelines
- ✅ Works with secret managers (AWS Secrets Manager, etc.)

### Changed

#### File Extensions
- 🔄 `ecosystem.config.js` → `ecosystem.config.cjs` (CommonJS for PM2)
  - Required because project uses ES modules (`"type": "module"`)
  - PM2 requires CommonJS format for config files

#### Documentation Updates
- 📝 `README.md` - Added PM2 and env vars documentation
- 📝 All PM2 references updated to use `.cjs` extension
- 📝 Reorganized documentation section with categories

### Fixed
- 🐛 ES module compatibility issue with PM2 config file
- 🐛 Updated all documentation to reference correct file extensions

## [1.0.0] - Previous Version

### Features
- ✅ Google Drive file sync
- ✅ Supabase vector storage
- ✅ Gemini AI embeddings
- ✅ Incremental sync
- ✅ REST API
- ✅ Cron scheduling
- ✅ Docker support
- ✅ PDF, Word, Google Docs support

---

## Migration from 1.0.0 to 1.1.0

### Required Changes

1. **Rename ecosystem config (if exists)**
   ```bash
   mv ecosystem.config.js ecosystem.config.cjs
   ```

2. **Update package.json** (already done automatically)
   - PM2 scripts now reference `.cjs` file

### Optional Changes

1. **Convert to environment variables**
   ```bash
   npm run convert-sa
   # Copy output to .env
   ```

2. **Setup PM2**
   ```bash
   npm install -g pm2
   npm run pm2:start
   pm2 save
   pm2 startup
   ```

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed instructions.

---

## Upgrade Instructions

### From 1.0.0 to 1.1.0

```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies (if any new)
npm install

# 3. Rename ecosystem config (if you have it)
[ -f ecosystem.config.js ] && mv ecosystem.config.js ecosystem.config.cjs

# 4. (Optional) Convert to env vars
npm run convert-sa

# 5. (Optional) Setup PM2
npm install -g pm2
npm run pm2:start
```

---

## Breaking Changes

### None

Version 1.1.0 is fully backward compatible with 1.0.0:
- ✅ Can still use `service-account.json`
- ✅ Can still run with `node` directly
- ✅ Can still use Docker/systemd
- ✅ All existing features work as before

New features are optional enhancements.

---

## Deprecations

### None

No features are deprecated in this version.

---

## Security

### Improvements
- ✅ Support for environment variables (more secure than JSON files)
- ✅ Better secret management for production
- ✅ Compatible with secret managers

### Recommendations
- 🔒 Use environment variables in production
- 🔒 Never commit `.env` or `service-account.json`
- 🔒 Rotate credentials regularly
- 🔒 Use secret managers (AWS Secrets Manager, etc.)

---

## Performance

### Improvements
- ✅ PM2 cluster mode support (can scale to multiple instances)
- ✅ Better memory management with auto-restart
- ✅ Zero-downtime reload capability

---

## Documentation

### New Files
- `PM2_GUIDE.md` - Complete PM2 guide
- `PM2_CHEATSHEET.md` - Quick reference
- `PM2_SETUP_SUMMARY.md` - Setup summary
- `MIGRATION_GUIDE.md` - Migration guide
- `NOTES.md` - Project notes
- `CHANGELOG.md` - This file
- `docs/SERVICE_ACCOUNT_ENV.md` - Env vars guide
- `QUICK_REFERENCE.md` - Quick reference
- `CHANGELOG_SERVICE_ACCOUNT.md` - Service account changelog

### Updated Files
- `README.md` - Added PM2 and env vars sections
- `.env.sample` - Added env vars options
- `.env.example` - New detailed example

---

## Contributors

- Development Team

---

## Links

- [GitHub Repository](https://github.com/your-repo)
- [Documentation](docs/)
- [Issues](https://github.com/your-repo/issues)

---

**Note:** This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
