# Troubleshooting Guide

## Common Issues and Solutions

### 1. Old .doc Files Not Processing

**Error Message:**
```
⚠️  Skipped document.doc: Old .doc format not supported. Please convert to .docx
```

**Cause:**
The `.doc` format (Word 97-2003) is not supported by the `mammoth` library. Only modern `.docx` format is supported.

**Solution:**

#### Quick Fix: Convert to .docx

**Option A: Microsoft Word**
1. Open the `.doc` file
2. File > Save As
3. Choose format: Word Document (.docx)
4. Save

**Option B: Google Drive**
1. Upload `.doc` to Google Drive
2. Right-click > Open with > Google Docs
3. File > Download > Microsoft Word (.docx)

**Option C: Batch Convert (Command Line)**
```bash
# Install LibreOffice
brew install --cask libreoffice  # macOS
sudo apt-get install libreoffice # Linux

# Convert all .doc files in a folder
for file in *.doc; do
  libreoffice --headless --convert-to docx "$file"
done
```

**Option D: Online Converter**
- [CloudConvert](https://cloudconvert.com/doc-to-docx)
- [Zamzar](https://www.zamzar.com/convert/doc-to-docx/)

See [Supported Formats](docs/SUPPORTED_FORMATS.md) for more details.

---

### 2. PM2 Config Error

**Error Message:**
```
ReferenceError: module is not defined in ES module scope
```

**Cause:**
Project uses ES modules but PM2 config needs CommonJS format.

**Solution:**
```bash
# Rename config file to .cjs
mv ecosystem.config.js ecosystem.config.cjs

# Update package.json (already done)
# Start PM2
npm run pm2:start
```

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for details.

---

### 3. Google Drive API Error

**Error Message:**
```
❌ Failed to initialize Google Drive API
```

**Possible Causes:**
1. Service account file not found
2. Invalid credentials
3. API not enabled

**Solutions:**

**Check 1: Verify service account file**
```bash
# If using JSON file
ls -la service-account.json

# If using env vars
cat .env | grep GOOGLE_SERVICE_ACCOUNT
```

**Check 2: Verify Google Drive API is enabled**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services > Library
4. Search "Google Drive API"
5. Click "Enable"

**Check 3: Verify folder permissions**
1. Share Google Drive folder with service account email
2. Grant "Viewer" or "Editor" access

---

### 4. Supabase Connection Error

**Error Message:**
```
❌ Supabase Connection Error
```

**Solutions:**

**Check 1: Verify credentials**
```bash
cat .env | grep SUPABASE
```

**Check 2: Test connection**
```bash
node -e "import('./src/services/supabase.js').then(m => m.default.initialize())"
```

**Check 3: Verify Supabase project status**
- Check [Supabase Dashboard](https://app.supabase.com)
- Ensure project is active
- Check for any service disruptions

---

### 5. Gemini API Error

**Error Message:**
```
❌ Gemini API Error
```

**Solutions:**

**Check 1: Verify API key**
```bash
cat .env | grep GEMINI_API_KEY
```

**Check 2: Check API quota**
1. Go to [Google AI Studio](https://makersuite.google.com)
2. Check API usage
3. Verify billing is enabled (if needed)

**Check 3: Test API**
```bash
node -e "import('./src/services/gemini.js').then(m => m.default.initialize())"
```

---

### 6. Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option 1: Kill the process**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Option 2: Change port**
```bash
# Edit .env
API_PORT=3001

# Restart
npm run pm2:restart
```

---

### 7. Memory Issues

**Error Message:**
```
JavaScript heap out of memory
```

**Solutions:**

**Option 1: Increase Node.js memory**
```bash
# Edit ecosystem.config.cjs
node_args: '--max-old-space-size=4096'
```

**Option 2: Reduce batch size**
```bash
# Edit src/utils/constants.js
PROCESSING_LIMITS: {
  CHUNK_SIZE: 2000,  // Reduce from 5000
}
```

**Option 3: Process fewer files at once**
```bash
# Edit src/sync.js
// Add delay between files
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

### 8. PM2 Not Starting

**Error Message:**
```
pm2: command not found
```

**Solution:**
```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Start services
npm run pm2:start
```

---

### 9. Empty Text Extraction

**Error Message:**
```
⚠️  File document.pdf has no extractable text content
```

**Possible Causes:**
1. PDF is scanned image (no text layer)
2. File is corrupted
3. File is password-protected

**Solutions:**

**For scanned PDFs:**
- Use OCR software to add text layer
- Convert to searchable PDF

**For corrupted files:**
- Try opening in original application
- Re-save or re-export the file

**For password-protected files:**
- Remove password protection
- Or skip these files

---

### 10. Logs Not Showing

**Issue:**
Can't see PM2 logs

**Solutions:**

**View logs:**
```bash
# All logs
npm run pm2:logs

# Specific service
pm2 logs rag-api
pm2 logs rag-cron

# Last 100 lines
pm2 logs --lines 100

# Only errors
pm2 logs --err
```

**Check log files:**
```bash
# Log files location
ls -la logs/

# View log file
tail -f logs/api-out.log
tail -f logs/cron-error.log
```

---

## Debugging Commands

### Check Configuration
```bash
# Verify .env file
cat .env

# Test config loading
node -e "import('./src/config/index.js').then(m => console.log(m.config))"
```

### Test Services
```bash
# Test Google Drive
node -e "import('./src/services/googleDrive.js').then(m => m.default.initialize())"

# Test Supabase
node -e "import('./src/services/supabase.js').then(m => m.default.initialize())"

# Test Gemini
node -e "import('./src/services/gemini.js').then(m => m.default.initialize())"
```

### Check PM2 Status
```bash
# Status
npm run pm2:status

# Detailed info
pm2 show rag-api
pm2 show rag-cron

# Monitor
npm run pm2:monit
```

### Check Logs
```bash
# PM2 logs
npm run pm2:logs

# Log files
tail -f logs/api-error.log
tail -f logs/cron-error.log

# Search logs
grep "ERROR" logs/*.log
grep "Skipped" logs/cron-out.log
```

---

## Getting Help

### 1. Check Documentation
- [README.md](README.md) - Main documentation
- [PM2_GUIDE.md](PM2_GUIDE.md) - PM2 deployment
- [docs/SUPPORTED_FORMATS.md](docs/SUPPORTED_FORMATS.md) - File formats
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration guide

### 2. Check Logs
```bash
# View recent logs
npm run pm2:logs --lines 50

# Check for errors
pm2 logs --err
```

### 3. Verify Configuration
```bash
# Check .env
cat .env | grep -v "PRIVATE_KEY"

# Validate PM2 config
node -e "const c = require('./ecosystem.config.cjs'); console.log(c)"
```

### 4. Test Components
```bash
# Test each service individually
npm run api    # Test API server
npm run cron   # Test cron job
```

### 5. Reset and Restart
```bash
# Stop all
npm run pm2:stop

# Clear logs
pm2 flush

# Restart
npm run pm2:start

# Check status
npm run pm2:status
```

---

## Prevention Tips

### 1. Regular Monitoring
```bash
# Setup monitoring
pm2 monit

# Check status regularly
npm run pm2:status
```

### 2. Log Rotation
```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Health Checks
```bash
# API health check
curl http://localhost:3000/health

# Check in cron
# Add to crontab:
# */5 * * * * curl -f http://localhost:3000/health || pm2 restart rag-api
```

### 4. Backup Configuration
```bash
# Backup .env
cp .env .env.backup

# Backup PM2 config
pm2 save
```

### 5. Update Dependencies
```bash
# Check for updates
npm outdated

# Update
npm update

# Restart
npm run pm2:restart
```

---

## Still Having Issues?

1. Check all logs: `npm run pm2:logs`
2. Verify all services are running: `npm run pm2:status`
3. Test each component individually
4. Check [GitHub Issues](https://github.com/your-repo/issues)
5. Create a new issue with:
   - Error message
   - Logs
   - Configuration (without secrets)
   - Steps to reproduce
