# 🌐 RAG API Documentation

REST API cho hệ thống RAG (Retrieval-Augmented Generation) với dữ liệu từ Google Drive.

## 🚀 Quick Start

### 1. Start API Server

```bash
npm run api
```

Server sẽ chạy tại: `http://localhost:3000`

### 2. Test API

```bash
curl http://localhost:3000/health
```

## 📡 Endpoints

### 1. Health Check

**GET** `/health`

Kiểm tra trạng thái server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-29T10:00:00.000Z",
  "uptime": 123.45
}
```

---

### 2. Get Statistics

**GET** `/api/stats`

Lấy thống kê về hệ thống RAG.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "status": "ready",
    "initialized": true
  }
}
```

---

### 3. Query RAG System

**POST** `/api/query`

Truy vấn câu hỏi và nhận câu trả lời từ RAG system.

**Request Body:**
```json
{
  "query": "Rau củ hữu cơ là gì?",
  "options": {
    "maxResults": 5,
    "similarityThreshold": 0.5,
    "includeMetadata": true,
    "language": "vi"
  }
}
```

**Parameters:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | Câu hỏi của người dùng |
| `options.maxResults` | number | ❌ No | 5 | Số document tối đa để retrieve |
| `options.similarityThreshold` | number | ❌ No | 0.5 | Ngưỡng similarity tối thiểu (0-1) |
| `options.includeMetadata` | boolean | ❌ No | true | Bao gồm metadata của documents |
| `options.language` | string | ❌ No | "vi" | Ngôn ngữ trả lời ("vi" hoặc "en") |

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Rau củ hữu cơ là sản phẩm được trồng và chăm sóc theo phương pháp canh tác hữu cơ, không sử dụng hóa chất tổng hợp...",
    "sources": [
      {
        "title": "Product Catalog 2024",
        "fileName": "product-catalog.pdf",
        "fileType": "pdf",
        "url": "https://drive.google.com/...",
        "similarity": 0.87,
        "excerpt": "Rau củ hữu cơ được trồng tại các trang trại...",
        "metadata": {
          "size": 245300,
          "mimeType": "application/pdf"
        }
      }
    ],
    "confidence": 0.87,
    "metadata": {
      "query": "Rau củ hữu cơ là gì?",
      "documentsFound": 10,
      "relevantDocuments": 5,
      "processingTime": 1234,
      "timings": {
        "embedding": 234,
        "search": 156,
        "generation": 844
      }
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | Câu trả lời được generate từ AI |
| `sources` | array | Danh sách documents nguồn |
| `sources[].title` | string | Tiêu đề document |
| `sources[].similarity` | number | Điểm similarity (0-1) |
| `sources[].excerpt` | string | Đoạn trích từ document |
| `confidence` | number | Độ tin cậy của câu trả lời (0-1) |
| `metadata` | object | Thông tin về quá trình xử lý |

---

### 4. Chat (Conversation Mode)

**POST** `/api/chat`

Chat với RAG system (hỗ trợ conversation history).

**Request Body:**
```json
{
  "query": "Còn giá như thế nào?",
  "history": [
    {
      "role": "user",
      "content": "Rau củ hữu cơ là gì?"
    },
    {
      "role": "assistant",
      "content": "Rau củ hữu cơ là..."
    }
  ],
  "options": {
    "language": "vi"
  }
}
```

**Response:** Giống như `/api/query`

---

### 5. API Documentation

**GET** `/api/docs`

Lấy full API documentation.

---

## 📝 Examples

### Example 1: Simple Query (cURL)

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Rau củ hữu cơ có lợi ích gì?"
  }'
```

### Example 2: Query with Options (cURL)

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are organic vegetables?",
    "options": {
      "maxResults": 3,
      "similarityThreshold": 0.7,
      "language": "en"
    }
  }'
```

### Example 3: JavaScript/Fetch

```javascript
async function queryRAG(question) {
  const response = await fetch('http://localhost:3000/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: question,
      options: {
        maxResults: 5,
        language: 'vi'
      }
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Answer:', data.data.answer);
    console.log('Sources:', data.data.sources.length);
    console.log('Confidence:', data.data.confidence);
  } else {
    console.error('Error:', data.message);
  }
}

// Usage
queryRAG('Rau củ hữu cơ là gì?');
```

### Example 4: Python

```python
import requests

def query_rag(question):
    url = "http://localhost:3000/api/query"
    
    payload = {
        "query": question,
        "options": {
            "maxResults": 5,
            "language": "vi"
        }
    }
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data["success"]:
        print(f"Answer: {data['data']['answer']}")
        print(f"Sources: {len(data['data']['sources'])}")
        print(f"Confidence: {data['data']['confidence']:.2%}")
    else:
        print(f"Error: {data['message']}")

# Usage
query_rag("Rau củ hữu cơ là gì?")
```

### Example 5: React Component

```jsx
import { useState } from 'react';

function RAGQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập câu hỏi..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Tìm kiếm'}
        </button>
      </form>

      {result && (
        <div>
          <h3>Câu trả lời:</h3>
          <p>{result.answer}</p>
          
          <h4>Nguồn tài liệu:</h4>
          <ul>
            {result.sources.map((source, i) => (
              <li key={i}>
                {source.title} - 
                Độ tương tự: {(source.similarity * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## ⚙️ Configuration

### Environment Variables

```env
API_PORT=3000                    # API server port
GEMINI_API_KEY=your_key         # For AI responses
SUPABASE_URL=your_url           # For document storage
SUPABASE_KEY=your_key           # Supabase access
```

### Custom Port

```bash
API_PORT=8080 npm run api
```

## 🔒 Security Considerations

### 1. Rate Limiting (Recommended)

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 2. Authentication

```javascript
// Add JWT or API key authentication
app.use('/api/', authenticateMiddleware);
```

### 3. CORS Configuration

```javascript
// Restrict to specific origins
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

### 4. Input Validation

```javascript
// Sanitize and validate inputs
import { body, validationResult } from 'express-validator';

app.post('/api/query', [
  body('query').isString().isLength({ min: 3, max: 500 }),
  // ... handle validation
]);
```

## 📊 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Endpoint not found |
| 500 | Internal Server Error | Server error |

## 🐛 Error Response Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "api"]
```

### PM2

```bash
pm2 start api-server.js --name rag-api
pm2 save
pm2 startup
```

### Cloud Platforms

- **Heroku**: `heroku create && git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Deploy as web service
- **DigitalOcean**: App Platform

## 📈 Performance Tips

1. **Caching**: Cache frequent queries
2. **Connection Pooling**: Reuse database connections
3. **Compression**: Enable gzip compression
4. **CDN**: Use CDN for static assets
5. **Monitoring**: Add logging and monitoring

## 🔧 Development

### Hot Reload

```bash
npm run api:dev
```

### Testing API

```bash
# Install httpie
brew install httpie

# Test query
http POST localhost:3000/api/query query="test question"
```

### Debug Mode

```bash
DEBUG=* npm run api
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Need help?** Create an issue on GitHub or check the main README.md

**Version**: 1.0.0  
**Last Updated**: 2025-10-29


