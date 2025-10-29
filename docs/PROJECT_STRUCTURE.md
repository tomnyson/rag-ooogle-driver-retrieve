# RAG Google Drive - Project Structure

Clean, organized project structure with refactored code.

## 📁 Directory Structure

```
rag-google-driver/
├── api-server.js           # API server entry point
├── cron-server.js          # Cron job server entry point
├── env.sample              # Environment variables template
├── package.json            # Project dependencies and scripts
│
├── src/                    # Source code
│   ├── config/            # Configuration management
│   ├── services/          # Business logic services
│   │   ├── gemini.js      # Gemini AI service
│   │   ├── googleDrive.js # Google Drive integration
│   │   ├── supabase.js    # Supabase database service
│   │   ├── fileProcessor.js # File text extraction
│   │   ├── rag.js         # RAG query service
│   │   └── container.js   # Service dependency injection
│   ├── utils/             # Utility modules
│   │   ├── logger.js      # Centralized logging
│   │   ├── errors.js      # Custom error classes
│   │   ├── validators.js  # Input validation
│   │   └── constants.js   # Application constants
│   └── sync.js            # Sync orchestration service
│
├── docs/                   # Documentation (*.md files)
├── scripts/                # Utility scripts
│   ├── check-config.js    # Config validation
│   ├── test-*.js          # Test scripts
│   ├── setup-oauth.js     # OAuth setup helper
│   └── kill-port.sh       # Utility scripts
│
├── examples/               # Usage examples
│   └── search-example.js  # Search example
│
├── database/               # Database setup
│   └── supabase-*.sql     # SQL schema files
│
└── deployment/             # Deployment configs
    ├── Dockerfile         # Docker configuration
    ├── docker-compose.yml # Docker Compose
    └── rag-google-drive.service # Systemd service

```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp env.sample .env
# Edit .env with your credentials

# Verify configuration
npm run check

# Run sync once
npm run cron:once

# Start API server
npm run api

# Start cron job (scheduled)
npm run cron
```

## 📦 NPM Scripts

### Production
- `npm run cron` - Start cron job scheduler
- `npm run cron:once` - Run sync once
- `npm run api` - Start API server (port 3000)
- `npm run api:8080` - Start API server on port 8080
- `npm run api:5000` - Start API server on port 5000

### Development
- `npm run cron:dev` - Cron with auto-reload
- `npm run api:dev` - API with auto-reload

### Utilities
- `npm run check` - Validate configuration
- `npm run test:list` - Test Google Drive listing
- `npm run test:vector` - Test vector processing
- `npm run search "query"` - Search example
- `npm run api:kill` - Kill process on port 3000

## 🔧 Refactoring Features

### ✅ Implemented
- **Dependency Injection** - Services use constructor injection
- **Centralized Logging** - Logger utility with structured logs
- **Error Handling** - Custom error classes
- **Input Validation** - Validators for API and services
- **Constants Management** - All magic values in one place
- **Service Container** - Manages service dependencies
- **Organized Structure** - Files organized by purpose

### 📝 Code Quality
- Comprehensive JSDoc comments
- Type-safe validations
- Consistent error handling
- Testable architecture
- Clean separation of concerns

## 📚 Documentation

All documentation moved to `/docs`:
- Setup guides
- API documentation
- Architecture overview
- Migration guides
- Deployment instructions

## 🧪 Testing

Test scripts in `/scripts`:
```bash
npm run check        # Check configuration
npm run test:list    # Test Drive file listing
npm run test:vector  # Test vector processing
```

## 🐳 Deployment

Deployment files in `/deployment`:
- Docker support
- Docker Compose
- Systemd service

See [deployment/README.md](deployment/README.md) for details.

## 📊 Database

Database setup files in `/database`:
- Supabase schema
- Vector extension setup

See [database/README.md](database/README.md) for details.

## 🎯 Next Steps

1. Review [docs/QUICKSTART.md](docs/QUICKSTART.md) for setup
2. Check [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for API usage
3. See [docs/REFACTORING_IMPLEMENTATION.md](docs/REFACTORING_IMPLEMENTATION.md) for refactoring details

---

**Version**: 1.0.0  
**License**: MIT
