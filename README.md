# RAG Google Drive

Node.js application to sync Google Drive files to Supabase vector storage with Gemini embeddings for RAG (Retrieval-Augmented Generation).

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env.sample .env
# Edit .env with your credentials

# 3. Verify configuration
npm run check

# 4. Run sync once
npm run cron:once

# 5. Start API server
npm run api
```

## 📦 Commands

### Main Services
```bash
npm run cron        # Start scheduled sync
npm run cron:once   # Sync once and exit
npm run api         # Start API server (port 3000)
npm run api:8080    # Start API on port 8080
```

### Development
```bash
npm run cron:dev    # Cron with auto-reload
npm run api:dev     # API with auto-reload
```

### Utilities
```bash
npm run check       # Verify configuration
npm run test:list   # Test Google Drive access
npm run test:vector # Test vector processing
npm run search "query" # Search example
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

## 🛠️ Setup

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed setup instructions.

## 🐳 Docker

```bash
cd deployment
docker-compose up -d
```

## 📝 License

MIT

---

For more details, check the [documentation](docs/).
# rag-ooogle-driver-retrieve
