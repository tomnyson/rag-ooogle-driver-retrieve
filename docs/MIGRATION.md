# Migration Guide: Upgrading to pgvector (Optional)

## Tại sao nên migrate sang pgvector?

Hiện tại, project đang sử dụng `jsonb[]` để lưu embeddings và tính cosine similarity trong Node.js. Điều này hoạt động tốt cho datasets nhỏ (< 1000 documents), nhưng có những hạn chế:

### Hạn chế của cách hiện tại (jsonb[]):
- ❌ Phải fetch toàn bộ documents để tính similarity
- ❌ Tính toán similarity trong application (chậm hơn)
- ❌ Tốn băng thông network
- ❌ Không có index optimization

### Ưu điểm khi dùng pgvector:
- ✅ Tính similarity trực tiếp trong PostgreSQL (nhanh hơn 10-100x)
- ✅ Sử dụng IVFFlat index cho search tối ưu
- ✅ Chỉ trả về top-K results
- ✅ Giảm network bandwidth
- ✅ Scale tốt với datasets lớn (millions of documents)

## Khi nào nên migrate?

- Bạn có > 1000 documents
- Search đang chậm (> 2-3 giây)
- Muốn scale lên hàng triệu documents
- Cần performance tốt nhất có thể

## Cách migrate

### Bước 1: Enable pgvector extension

```sql
-- Chạy trong Supabase SQL Editor
create extension if not exists vector;
```

### Bước 2: Thêm column vector mới

```sql
-- Thêm column embedding_vector kiểu vector(768)
alter table public.knowledge_base 
  add column if not exists embedding_vector vector(768);
```

### Bước 3: Migrate dữ liệu hiện có

```sql
-- Convert jsonb[] sang vector type
-- Chỉ chạy 1 lần!
update public.knowledge_base
set embedding_vector = (
  select (
    '[' || 
    array_to_string(
      array(
        select jsonb_array_elements_text(embedding[1])
      ), ','
    ) || ']'
  )::vector(768)
)
where embedding is not null 
  and embedding_vector is null
  and jsonb_array_length(embedding) > 0;
```

### Bước 4: Tạo index

```sql
-- Tạo IVFFlat index cho fast similarity search
create index knowledge_base_embedding_vector_idx 
  on public.knowledge_base 
  using ivfflat (embedding_vector vector_cosine_ops)
  with (lists = 100);

-- lists = sqrt(total_rows) là optimal
-- Ví dụ: 10000 rows -> lists = 100
```

### Bước 5: Tạo search function

```sql
create or replace function match_knowledge_base (
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_teacher_id uuid default null
)
returns table (
  id uuid,
  title text,
  file_name text,
  file_type text,
  content text,
  file_url text,
  teacher_id uuid,
  user_id uuid,
  metadata jsonb,
  created_at timestamp with time zone,
  similarity float
)
language sql stable
as $$
  select
    kb.id,
    kb.title,
    kb.file_name,
    kb.file_type,
    kb.content,
    kb.file_url,
    kb.teacher_id,
    kb.user_id,
    kb.metadata,
    kb.created_at,
    1 - (kb.embedding_vector <=> query_embedding) as similarity
  from knowledge_base kb
  where 
    kb.embedding_vector is not null
    and (filter_teacher_id is null or kb.teacher_id = filter_teacher_id)
    and 1 - (kb.embedding_vector <=> query_embedding) > match_threshold
  order by kb.embedding_vector <=> query_embedding
  limit match_count;
$$;
```

### Bước 6: Cập nhật code

#### 6.1. Cập nhật `supabase.js` - upsertDocument

```javascript
// Thêm vào recordData trong upsertDocument()
const recordData = {
  // ... các field khác ...
  embedding: embeddingJsonb,
  embedding_vector: document.embedding, // Thêm dòng này
  // ... các field khác ...
};
```

#### 6.2. Cập nhật `supabase.js` - searchSimilarDocuments

Thay thế hàm `searchSimilarDocuments` bằng:

```javascript
async searchSimilarDocuments(queryEmbedding, limit = 10, teacherId = null) {
  try {
    // Convert array to pgvector format
    const vectorString = `[${queryEmbedding.join(',')}]`;
    
    const { data, error } = await this.client.rpc('match_knowledge_base', {
      query_embedding: vectorString,
      match_threshold: 0.5,
      match_count: limit,
      filter_teacher_id: teacherId
    });

    if (error) {
      throw error;
    }

    console.log(`🔍 Found ${data.length} similar documents`);
    return data;
  } catch (error) {
    console.error('❌ Error searching similar documents:', error.message);
    throw error;
  }
}
```

#### 6.3. Cập nhật `search-example.js`

Thay thế phần search bằng:

```javascript
// Search for similar documents using pgvector
console.log('📊 Searching database...\n');

const vectorString = `[${queryEmbedding.join(',')}]`;

const { data, error } = await supabase.rpc('match_knowledge_base', {
  query_embedding: vectorString,
  match_threshold: threshold,
  match_count: limit
});

if (error) {
  throw error;
}

if (data.length === 0) {
  console.log('❌ No results found. Try lowering the similarity threshold.\n');
  return;
}

// Display results (same as before)
```

### Bước 7: Test

```bash
# Test sync
npm start once

# Test search
npm run search "test query"
```

## Verify migration

```sql
-- Check xem có bao nhiêu documents đã có embedding_vector
select 
  count(*) as total_documents,
  count(embedding) as has_jsonb_embedding,
  count(embedding_vector) as has_vector_embedding
from knowledge_base;

-- Test search function
select title, file_name, similarity
from match_knowledge_base(
  (select embedding_vector from knowledge_base limit 1),
  0.5,
  5
);
```

## Performance comparison

### Before (jsonb[] + JS cosine similarity):
- 1000 docs: ~500-1000ms
- 10000 docs: ~5-10s
- 100000 docs: không khả thi

### After (pgvector + IVFFlat index):
- 1000 docs: ~10-50ms
- 10000 docs: ~50-100ms
- 100000 docs: ~100-200ms
- 1000000 docs: ~200-500ms

## Rollback (nếu cần)

```sql
-- Xóa column vector nếu muốn rollback
alter table knowledge_base drop column if exists embedding_vector;

-- Xóa function
drop function if exists match_knowledge_base;
```

Code sẽ tự động fallback về cách cũ (jsonb[] + JS).

## Maintain both approaches

Nếu muốn giữ cả 2 cách (jsonb[] và vector), bạn có thể:

1. Giữ cả 2 columns: `embedding` (jsonb[]) và `embedding_vector` (vector)
2. Sync tự động cập nhật cả 2
3. Tùy config để chọn cách search

```javascript
// Trong config/index.js
export const config = {
  // ...
  search: {
    useVector: process.env.USE_PGVECTOR === 'true', // default: false
  }
};

// Trong supabase.js
async searchSimilarDocuments(queryEmbedding, limit = 10) {
  if (config.search.useVector) {
    return this.searchWithPgvector(queryEmbedding, limit);
  } else {
    return this.searchWithJsonb(queryEmbedding, limit);
  }
}
```

## Lưu ý

1. **Không bắt buộc**: Migration này hoàn toàn optional. Nếu dataset nhỏ (< 1000 docs), giữ nguyên cách hiện tại cũng ổn.

2. **Downtime**: Migration có thể mất vài phút tùy số lượng documents. Nên chạy khi ít traffic.

3. **Storage**: Vector column sẽ tốn thêm storage (768 floats = ~3KB/doc).

4. **Index**: IVFFlat index cần tune `lists` parameter dựa trên số lượng documents.

## Best practices

- Start với `lists = 100` cho < 10K docs
- Tăng lên `lists = 1000` cho 100K-1M docs
- Monitor query performance và adjust

---

Cần trợ giúp? Tạo issue trên GitHub!


