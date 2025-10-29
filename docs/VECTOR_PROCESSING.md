# 🔢 Vector Processing & Storage Guide

Hướng dẫn chi tiết về cách xử lý vector embeddings và lưu vào Supabase.

## 📊 Flow Tổng Quan

```
1. Extract Text from File (PDF/Word)
   │
   ▼
2. Clean & Normalize Text
   │
   ▼
3. Generate Embeddings with Gemini AI
   │ (Output: Array of 768 numbers)
   │
   ▼
4. Convert to jsonb[] format
   │ (Wrap: [array] → jsonb[])
   │
   ▼
5. Save to Supabase knowledge_base
   │
   └─► Vector stored as jsonb[]
```

## 🔧 Chi Tiết Từng Bước

### Bước 1: Extract Text
```javascript
// Từ PDF
const rawText = await fileProcessor.extractFromPDF(fileBuffer);

// Từ Word
const rawText = await fileProcessor.extractFromWord(fileBuffer);
```

**Output**: Raw text string

### Bước 2: Clean Text
```javascript
const cleanedText = fileProcessor.cleanText(rawText);
```

**Xử lý**:
- Remove multiple spaces → single space
- Remove multiple newlines → single newline
- Trim whitespace

**Output**: Cleaned text string

### Bước 3: Generate Embeddings

```javascript
const embeddings = await geminiService.generateEmbeddings(cleanedText);
```

**Chi tiết**:
- Model: `embedding-001` (Gemini)
- Input: Text (max 20,000 chars)
- Output: Array of 768 floating point numbers
- Dimensions: 768

**Example output**:
```javascript
[
  0.0123456789,
  -0.0234567890,
  0.0345678901,
  // ... 765 more numbers
]
```

### Bước 4: Convert to jsonb[] Format

```javascript
// In Supabase service
const embeddingJsonb = document.embedding ? [document.embedding] : null;
```

**Lý do**: 
- Database column type: `jsonb[]`
- Cần wrap array trong array: `[embedding]`

**Format lưu vào DB**:
```javascript
// Trước: 768 numbers
[0.012, -0.023, 0.034, ...]

// Sau: Wrap trong array
[[0.012, -0.023, 0.034, ...]]
```

### Bước 5: Save to Supabase

```javascript
const recordData = {
  title: "Document Title",
  content: "Full text content...",
  file_name: "document.pdf",
  file_type: "pdf",
  embedding: embeddingJsonb,  // [[768 numbers]]
  metadata: {
    driveFileId: "xyz123",
    size: 245300,
    mimeType: "application/pdf",
    textLength: 5000
  },
  chunk_index: 0,
  teacher_id: null,
  user_id: null
};

await supabase.from('knowledge_base').insert(recordData);
```

## 📐 Vector Dimensions

Gemini `embedding-001` tạo vectors với **768 dimensions**:

```
[d₀, d₁, d₂, ... d₇₆₇]
```

Mỗi dimension là một số thực (float) từ -1 đến 1.

## 💾 Database Storage

### Table Schema
```sql
embedding jsonb[] null
```

### Stored Format
```json
[
  [0.012, -0.023, 0.034, ..., 0.078]
]
```

Là một array chứa một array (jsonb[])

### Tại sao jsonb[] thay vì vector(768)?

**Hiện tại**: `jsonb[]`
- ✅ Flexible, không cần pgvector extension
- ⚠️ Slower for similarity search (calculate in app)
- ✅ Works out of the box

**Future upgrade**: `vector(768)` (pgvector)
- ✅ Much faster similarity search (10-100x)
- ✅ Native PostgreSQL operations
- ⚠️ Requires migration (see MIGRATION.md)

## 🔍 Similarity Search

### Current Method (jsonb[])

```javascript
// Fetch all documents
const { data: allDocs } = await supabase
  .from('knowledge_base')
  .select('*')
  .not('embedding', 'is', null);

// Calculate cosine similarity in JavaScript
const results = allDocs
  .map(doc => {
    const docEmbedding = doc.embedding[0]; // Get array from jsonb[]
    const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
    return { ...doc, similarity };
  })
  .filter(doc => doc.similarity > 0.5)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 10);
```

### Cosine Similarity Formula

```javascript
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Output**: Value từ -1 đến 1
- `1.0` = Giống hệt
- `0.5` = Tương đối giống
- `0.0` = Không liên quan
- `-1.0` = Ngược lại hoàn toàn

## 📊 Example Data

### Input Document
```
File: "Product Catalog 2024.pdf"
Size: 1.2 MB
Content: "Our company offers premium vegetables including tomatoes, 
          cucumbers, and bell peppers. All products are organic..."
```

### Processing
```javascript
// 1. Extract text
text = "Our company offers premium vegetables..."

// 2. Generate embeddings
embeddings = [0.0234, -0.0156, 0.0789, ..., 0.0123] // 768 numbers

// 3. Store in database
{
  title: "Product Catalog 2024",
  file_name: "Product Catalog 2024.pdf",
  content: "Our company offers premium vegetables...",
  embedding: [[0.0234, -0.0156, 0.0789, ..., 0.0123]]
}
```

### Query & Search
```javascript
// Query: "organic vegetables"
queryEmbedding = [0.0245, -0.0167, 0.0801, ..., 0.0134]

// Similarity calculation
similarity = cosineSimilarity(queryEmbedding, docEmbedding)
// Result: 0.87 (High similarity! ✅)
```

## ⚡ Performance

### Current (jsonb[])
- ✅ 10-100 documents: < 100ms
- ⚠️ 100-1000 documents: 1-5s
- ❌ 1000+ documents: > 5s

### With pgvector (recommended for scale)
- ✅ 10-100 documents: < 10ms
- ✅ 100-1000 documents: 10-50ms
- ✅ 1000-100K documents: 50-200ms
- ✅ 100K-1M documents: 200-500ms

**Recommendation**: Nếu có > 1000 documents, xem [MIGRATION.md](MIGRATION.md) để upgrade lên pgvector.

## 🧪 Testing Vector Processing

### Test 1: Generate Embeddings
```bash
# Test tạo embeddings từ text
node -e "
import('./src/services/gemini.js').then(async ({ default: gemini }) => {
  await gemini.initialize();
  const embeddings = await gemini.generateEmbeddings('test text');
  console.log('Dimensions:', embeddings.length);
  console.log('First 5 values:', embeddings.slice(0, 5));
});
"
```

### Test 2: Full Pipeline
```bash
# Run sync một file để test
npm start once
```

### Test 3: Search
```bash
# Test tìm kiếm
npm run search "test query"
```

## 🔧 Troubleshooting

### Issue 1: "embedding is null"

**Nguyên nhân**: Gemini API failed hoặc text quá dài

**Fix**:
```javascript
// Check text length before generating
if (cleanedText.length > 20000) {
  cleanedText = cleanedText.substring(0, 20000);
}
```

### Issue 2: "Invalid embedding format"

**Nguyên nhân**: Embedding không phải array

**Fix**:
```javascript
// Verify embeddings is array
if (!Array.isArray(embeddings) || embeddings.length !== 768) {
  throw new Error('Invalid embeddings format');
}
```

### Issue 3: "Search returns no results"

**Nguyên nhân**: 
1. Embeddings chưa được tạo
2. Similarity threshold quá cao

**Fix**:
```javascript
// Lower threshold
.filter(doc => doc.similarity > 0.3) // Instead of 0.5
```

## 📚 Best Practices

### 1. Text Preprocessing
```javascript
// Clean text before embedding
text = text
  .toLowerCase()           // Normalize case
  .replace(/\s+/g, ' ')   // Single spaces
  .trim();                 // Remove edges
```

### 2. Chunk Long Documents
```javascript
// For documents > 20K chars
const chunks = gemini.splitTextIntoChunks(text, 5000);
const embeddings = await gemini.generateBatchEmbeddings(chunks);
// Store each chunk separately with chunk_index
```

### 3. Error Handling
```javascript
try {
  const embeddings = await gemini.generateEmbeddings(text);
} catch (error) {
  console.error('Failed to generate embeddings:', error);
  // Skip this document or retry
  return;
}
```

### 4. Rate Limiting
```javascript
// Add delay between API calls
await new Promise(resolve => setTimeout(resolve, 500));
```

## 🎯 Summary

**Vector Processing Flow**:
1. Text extraction → 2. Cleaning → 3. Embeddings (768d) → 4. jsonb[] format → 5. Save to DB

**Key Points**:
- ✅ Gemini embedding-001: 768 dimensions
- ✅ Storage: jsonb[] (flexible, slower search)
- ✅ Search: JavaScript cosine similarity
- ⚡ Upgrade option: pgvector for better performance

**Next Steps**:
- Run `npm start once` to process files
- Use `npm run search "query"` to test search
- Monitor performance with many documents
- Consider pgvector migration if needed

---

Questions? Check [MIGRATION.md](MIGRATION.md) for pgvector upgrade guide!


