# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-10-29

### Changed
- **BREAKING**: Migrated from `documents` table to `knowledge_base` table
- Changed embedding storage from `vector(768)` to `jsonb[]` format
- Updated search to use client-side cosine similarity calculation
- Removed `summary` field (can be stored in metadata if needed)
- Changed unique identifier from `file_id` to `file_name`

### Added
- Support for `teacher_id` and `user_id` columns in knowledge_base table
- Support for `chunk_index` for future chunking features
- Added `title` field for document titles
- Added `file_path` field for local file paths
- Changed `web_view_link` to `file_url`
- New SQL setup file: `supabase-setup-knowledge-base.sql`
- Migration guide for upgrading to pgvector (optional): `MIGRATION.md`
- Manual cosine similarity calculation in Supabase service

### Configuration
- Added `TEACHER_ID` environment variable
- Added `USER_ID` environment variable

### Performance
- Current implementation fetches all documents for similarity search
- For better performance with large datasets (>1000 docs), see MIGRATION.md for pgvector upgrade

## [1.0.0] - 2025-10-29

### Initial Release
- Google Drive integration with OAuth2
- Support for PDF, Word documents (docx, doc), and Google Docs
- Gemini AI integration for embeddings and summarization
- Supabase vector storage
- Cron job scheduler
- Incremental sync (only updates changed files)
- Docker support
- Comprehensive documentation

### Features
- Automatic file extraction and text processing
- 768-dimensional embeddings using Gemini embedding-001 model
- Vector similarity search
- Configurable cron schedule
- Statistics and logging
- Error handling and retry logic

### Documentation
- README.md - Complete usage guide
- QUICKSTART.md - 5-minute quick start
- DEPLOYMENT.md - Production deployment guide
- ARCHITECTURE.md - System architecture documentation

---

## Migration Notes

### From v1.0.0 to v1.1.0

If you were using v1.0.0 with the `documents` table:

1. **Option A: Fresh Start**
   - Use your existing `knowledge_base` table
   - Run sync to populate it with fresh data

2. **Option B: Migrate Data**
   ```sql
   -- Copy data from documents to knowledge_base
   insert into knowledge_base (
     title,
     content,
     file_name,
     file_url,
     file_type,
     embedding,
     metadata,
     created_at,
     updated_at
   )
   select
     file_name as title,
     content,
     file_name,
     web_view_link as file_url,
     file_type,
     ARRAY[embedding::jsonb] as embedding, -- Convert vector to jsonb[]
     metadata,
     created_at,
     updated_at
   from documents;
   ```

3. **Update configuration**
   - Add `TEACHER_ID` and `USER_ID` to your `.env` file if needed

4. **Test**
   - Run `npm start once` to verify sync works
   - Run `npm run search "test"` to verify search works

### Breaking Changes

- Table name changed from `documents` to `knowledge_base`
- Embedding format changed from `vector(768)` to `jsonb[]`
- `summary` field removed (store in metadata if needed)
- `web_view_link` renamed to `file_url`
- `file_id` no longer used as unique key (using `file_name` instead)

### Compatibility

- Node.js >= 18.x required
- Supabase with `knowledge_base` table
- Google Drive API v3
- Gemini AI API (embedding-001 model)

---

For upgrade assistance, see MIGRATION.md or create an issue on GitHub.


