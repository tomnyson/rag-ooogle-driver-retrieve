# 🚀 Quick Start - API Server

## 📝 Nhanh Nhanh

```bash
# 1. Kill port nếu đang bị chiếm
npm run api:kill

# 2. Start API
npm run api
```

## 🔧 Các Lệnh

### Start API Server

```bash
npm run api
```

Server chạy tại: `http://localhost:3000`

### Development Mode (Auto-reload)

```bash
npm run api:dev
```

### Kill Port 3000

```bash
npm run api:kill
```

Hoặc thủ công:

```bash
# Tìm process đang dùng port 3000
lsof -ti:3000

# Kill process (thay PID bằng số hiện ra)
kill -9 PID
```

### Đổi Port

Nếu muốn dùng port khác:

```bash
API_PORT=8080 npm run api
```

Hoặc thêm vào `.env`:

```env
API_PORT=8080
```

## ✅ Test API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Kết quả:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-29T...",
  "uptime": 12.34
}
```

### 2. Get Statistics

```bash
curl http://localhost:3000/api/stats
```

### 3. Query RAG

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Rau củ hữu cơ là gì?"
  }'
```

### 4. Query với Options

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Organic vegetables benefits?",
    "options": {
      "maxResults": 3,
      "similarityThreshold": 0.7,
      "language": "en"
    }
  }'
```

## 🐛 Common Issues

### Issue 1: Port already in use

**Lỗi:** `Error: listen EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
npm run api:kill
npm run api
```

### Issue 2: No documents found

**Nguyên nhân:** Chưa sync data từ Google Drive

**Fix:**
```bash
# Sync data trước
npm start once

# Sau đó start API
npm run api
```

### Issue 3: Gemini API error

**Nguyên nhân:** API key không hợp lệ hoặc hết quota

**Fix:**
- Check `GEMINI_API_KEY` trong `.env`
- Verify quota tại: https://makersuite.google.com

### Issue 4: Supabase connection error

**Nguyên nhân:** Supabase credentials không đúng

**Fix:**
```bash
# Verify config
npm run check
```

## 📊 API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/stats` | GET | System statistics |
| `/api/docs` | GET | API documentation |
| `/api/query` | POST | Query RAG system |
| `/api/chat` | POST | Chat with history |

## 🎯 Complete Workflow

```bash
# 1. Verify config
npm run check

# 2. Sync data from Google Drive (if needed)
npm start once

# 3. Kill any process on port 3000
npm run api:kill

# 4. Start API server
npm run api

# 5. Test in another terminal
curl http://localhost:3000/health

# 6. Try a query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test question"}'
```

## 🌐 Access from Other Devices

Nếu muốn access API từ device khác trong cùng mạng:

```bash
# Find your IP
ipconfig getifaddr en0

# Start API
npm run api

# Access from other device
curl http://YOUR_IP:3000/health
```

## 🔒 Production Tips

### 1. Use Process Manager (PM2)

```bash
npm install -g pm2

pm2 start api-server.js --name rag-api
pm2 save
pm2 startup
```

### 2. Enable HTTPS

Use reverse proxy như Nginx hoặc Caddy

### 3. Add Authentication

```javascript
// In api-server.js
app.use('/api/', authenticateMiddleware);
```

### 4. Rate Limiting

```bash
npm install express-rate-limit
```

### 5. Monitoring

```bash
pm2 monitor
# or use services like Datadog, New Relic
```

## 📱 Frontend Integration

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<body>
  <input id="query" type="text" placeholder="Nhập câu hỏi...">
  <button onclick="search()">Tìm kiếm</button>
  <div id="result"></div>

  <script>
    async function search() {
      const query = document.getElementById('query').value;
      
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('result').innerHTML = 
          `<p><strong>Trả lời:</strong> ${data.data.answer}</p>
           <p><strong>Độ tin cậy:</strong> ${(data.data.confidence * 100).toFixed(1)}%</p>`;
      }
    }
  </script>
</body>
</html>
```

### React

```jsx
import { useState } from 'react';

function RAGSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      if (data.success) setResult(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập câu hỏi..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Tìm kiếm'}
      </button>
      {result && (
        <div>
          <p><strong>Trả lời:</strong> {result.answer}</p>
          <p><strong>Nguồn:</strong> {result.sources.length} tài liệu</p>
        </div>
      )}
    </div>
  );
}
```

## 🎉 Ready!

API server của bạn đã sẵn sàng!

**Next Steps:**
1. Start API: `npm run api`
2. Test với curl
3. Integrate vào frontend
4. Deploy to production

**Need help?** Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full docs!


