# Architecture Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cron Scheduler                           │
│                     (node-cron: 0 2 * * *)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Sync Service                              │
│  - Initialize all services                                       │
│  - Orchestrate sync process                                      │
│  - Error handling & retry logic                                  │
│  - Statistics & reporting                                        │
└──┬───────────────┬──────────────────┬──────────────────────┬────┘
   │               │                  │                      │
   ▼               ▼                  ▼                      ▼
┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐
│  Google  │  │   Gemini   │  │  Supabase   │  │ File Processor   │
│  Drive   │  │    AI      │  │   Vector    │  │  (PDF/Word)      │
│  API     │  │  Service   │  │   Storage   │  │                  │
└──────────┘  └────────────┘  └─────────────┘  └──────────────────┘
     │              │                │                   │
     │              │                │                   │
     ▼              ▼                ▼                   ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│  Files  │  │Embeddings│  │ PostgreSQL   │  │  Extracted   │
│  List   │  │(768 dim) │  │ + pgvector   │  │    Text      │
└─────────┘  └──────────┘  └──────────────┘  └──────────────┘
```

## 📦 Component Overview

### 1. **Sync Service** (`src/sync.js`)
- Main orchestrator
- Coordinates all services
- Handles sync workflow
- Collects statistics

### 2. **Google Drive Service** (`src/services/googleDrive.js`)
- Authenticates with OAuth2
- Lists files (PDF, Word, Google Docs)
- Downloads file content
- Handles rate limiting

### 3. **Gemini AI Service** (`src/services/gemini.js`)
- Generates text embeddings (768 dimensions)
- Creates summaries
- Handles text chunking
- Batch processing support

### 4. **Supabase Service** (`src/services/supabase.js`)
- Manages database connections
- Upserts documents with vectors
- Performs similarity searches
- Tracks update status

### 5. **File Processor Service** (`src/services/fileProcessor.js`)
- Extracts text from PDFs (pdf-parse)
- Extracts text from Word docs (mammoth)
- Cleans and normalizes text
- Type detection

## 🔄 Data Flow

### Sync Process Flow

```
1. START
   │
   ▼
2. List all files from Google Drive
   │ (Filter: PDF, Word, Google Docs)
   │
   ▼
3. For each file:
   │
   ├─► Check if needs update (compare modified_time)
   │   │
   │   ├─► No changes? → Skip
   │   │
   │   └─► Has changes or new? → Continue
   │       │
   │       ▼
   ├─► Download file from Drive
   │
   ▼
4. Extract text content
   │ (PDF: pdf-parse, Word: mammoth)
   │
   ▼
5. Clean and normalize text
   │
   ▼
6. Generate summary with Gemini
   │
   ▼
7. Generate embeddings with Gemini
   │ (Output: 768-dimensional vector)
   │
   ▼
8. Upsert to Supabase
   │ (Vector + metadata)
   │
   ▼
9. COMPLETE
   │
   └─► Generate statistics report
```

### Search Process Flow

```
1. User provides search query
   │
   ▼
2. Generate query embedding with Gemini
   │ (768-dimensional vector)
   │
   ▼
3. Execute vector similarity search in Supabase
   │ (Cosine similarity using pgvector)
   │
   ▼
4. Return top-K similar documents
   │
   └─► Display results with similarity scores
```

## 🗄️ Database Schema

### Table: `documents`

```sql
documents (
  id                uuid PRIMARY KEY,
  file_id           text UNIQUE NOT NULL,      -- Google Drive file ID
  file_name         text NOT NULL,             -- Original filename
  file_type         text NOT NULL,             -- pdf, docx, doc, google-doc
  content           text NOT NULL,             -- Full text content
  summary           text,                      -- AI-generated summary
  embedding         vector(768),               -- Gemini embeddings
  metadata          jsonb,                     -- Additional metadata
  web_view_link     text,                      -- Google Drive link
  modified_time     timestamptz,               -- Last modified in Drive
  created_at        timestamptz DEFAULT now(), -- Created in DB
  updated_at        timestamptz DEFAULT now()  -- Last updated in DB
)
```

### Indexes

1. **Vector Similarity Index** (IVFFlat)
   ```sql
   CREATE INDEX documents_embedding_idx 
   ON documents USING ivfflat (embedding vector_cosine_ops)
   WITH (lists = 100);
   ```

2. **File ID Index** (Unique lookups)
   ```sql
   CREATE INDEX documents_file_id_idx ON documents(file_id);
   ```

3. **File Name Index** (Text searches)
   ```sql
   CREATE INDEX documents_file_name_idx ON documents(file_name);
   ```

## 🔌 API Integration Details

### Google Drive API

**Authentication**: OAuth 2.0
- Flow: Authorization Code Grant
- Scopes: `https://www.googleapis.com/auth/drive.readonly`
- Token Storage: Refresh token in environment variables

**Endpoints Used**:
- `files.list` - List files with filters
- `files.get` - Download file content
- `files.export` - Export Google Docs

### Gemini AI API

**Authentication**: API Key
- Model: `embedding-001` (for embeddings)
- Model: `gemini-pro` (for summaries)

**Endpoints**:
- `embedContent` - Generate embeddings
- `generateContent` - Generate summaries

### Supabase API

**Authentication**: Service Role Key (anon key)
- Client: `@supabase/supabase-js`

**Operations**:
- Table operations (insert, update, select)
- RPC calls (vector similarity search)

## ⚡ Performance Considerations

### 1. Rate Limiting

- **Google Drive API**: 1000 requests/100 seconds
  - Mitigation: 500ms delay between files
  
- **Gemini API**: 60 requests/minute
  - Mitigation: 100ms delay between requests

### 2. Batch Processing

- Files processed sequentially (not parallel)
- Prevents rate limit issues
- Easier error tracking

### 3. Incremental Sync

- Only syncs changed files
- Compares `modified_time` from Drive with DB
- Significantly reduces API calls

### 4. Memory Management

- Files streamed as buffers
- No persistent file storage
- Text cleaned to reduce memory footprint

### 5. Vector Search Optimization

- IVFFlat index for faster searches
- Configurable similarity threshold
- Limit results (top-K)

## 🔒 Security Architecture

### 1. Credential Management

```
Environment Variables (.env)
    │
    ├─► Google OAuth (refresh token)
    ├─► Gemini API Key
    └─► Supabase Keys
```

### 2. Access Control

- **Google Drive**: Read-only scope
- **Supabase**: Anon key (can be restricted with RLS)
- **Service**: Runs as non-root user (Docker/systemd)

### 3. Data Protection

- No local file storage
- Credentials never logged
- API keys in environment only

## 📊 Monitoring & Logging

### Metrics Collected

```javascript
{
  processed: 0,      // Successfully processed files
  skipped: 0,        // Already up-to-date files
  errors: 0,         // Failed files
  startTime: Date,   // Sync start time
  endTime: Date,     // Sync end time
  duration: Number   // Total duration
}
```

### Log Levels

- `INFO` - Normal operations
- `WARN` - Recoverable issues
- `ERROR` - Failed operations

### Log Output

- **Docker**: stdout/stderr → Docker logs
- **Systemd**: journald
- **Development**: console

## 🚀 Deployment Patterns

### 1. Docker Container (Recommended)

```
Host System
  │
  └─► Docker Container
        │
        ├─► Node.js Runtime
        ├─► Application Code
        └─► Cron Scheduler
```

### 2. Systemd Service

```
Linux Server
  │
  ├─► systemd
  │     └─► rag-google-drive.service
  │           └─► Node.js Process
  │
  └─► journald (logs)
```

### 3. Cloud Platforms

- **Heroku**: Background worker dyno
- **Railway**: Background service
- **Render**: Background worker
- **DigitalOcean**: App Platform worker

## 🔄 Error Handling Strategy

### 1. Retry Logic

- Network errors: Automatic retry
- Rate limits: Exponential backoff
- API errors: Log and continue

### 2. Graceful Degradation

- Single file failure: Continue with next
- Summary generation failure: Use truncated text
- Embedding failure: Skip file

### 3. Recovery Mechanisms

- Process killed: Next cron will resume
- Partial sync: Incremental design handles this
- Data corruption: Manual re-sync option

## 📈 Scalability Considerations

### Current Limitations

1. **Sequential Processing**: One file at a time
2. **Single Instance**: No distributed processing
3. **Memory**: Limited by Node.js heap

### Scaling Strategies

1. **Horizontal Scaling**
   - Multiple instances with folder partitioning
   - Queue-based architecture (Bull, BullMQ)

2. **Vertical Scaling**
   - Increase memory limits
   - Faster CPU for PDF processing

3. **Optimization**
   - Parallel file downloads
   - Batch embedding generation
   - Caching layer (Redis)

## 🧪 Testing Strategy

### Unit Tests (Recommended to add)

```javascript
// Example test structure
describe('FileProcessor', () => {
  test('extracts text from PDF', async () => {
    const buffer = loadTestPDF();
    const text = await fileProcessor.extractFromPDF(buffer);
    expect(text).toBeDefined();
  });
});
```

### Integration Tests

- Test OAuth flow
- Test Gemini API integration
- Test Supabase operations

### End-to-End Tests

- Upload test file to Drive
- Run sync
- Verify in Supabase
- Test search functionality

---

## 📚 Additional Resources

- [Google Drive API Docs](https://developers.google.com/drive/api)
- [Gemini AI Docs](https://ai.google.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)

---

**Version**: 1.0.0  
**Last Updated**: 2025


