# 🤖 Gemini Models Update

## 📋 Model Changes

Google đã cập nhật các models. Dự án đã được update để sử dụng models mới nhất.

## 🔄 Models Đang Sử dụng

### Text Generation
- **Old**: ❌ `gemini-pro` (deprecated)
- **New**: ✅ `gemini-1.5-flash` (faster, cheaper)
- **Alternative**: `gemini-1.5-pro` (more powerful, slower)

### Embeddings
- **Old**: ❌ `embedding-001` (deprecated)
- **New**: ✅ `text-embedding-004` (768 dimensions)

## ⚡ Model Comparison

### gemini-1.5-flash (Current Choice)
- ✅ **Speed**: Very fast (~1-2s)
- ✅ **Cost**: Cheapest option
- ✅ **Quality**: Good for most use cases
- ✅ **Context**: 1M tokens
- 💰 **Price**: Free tier: 15 RPM, 1M TPM

### gemini-1.5-pro (Alternative)
- ✅ **Speed**: Moderate (~3-5s)
- ⚠️  **Cost**: More expensive
- ✅ **Quality**: Best quality
- ✅ **Context**: 2M tokens
- 💰 **Price**: Free tier: 2 RPM, 32K TPM

### text-embedding-004 (Embeddings)
- ✅ **Dimensions**: 768
- ✅ **Quality**: Latest embedding model
- ✅ **Speed**: Fast
- 💰 **Price**: Free tier: 1500 RPM

## 🔧 Switch Models

### Option 1: Change in Code

Edit `src/services/gemini.js`:

```javascript
// For faster responses (current)
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' 
});

// For better quality (alternative)
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' 
});
```

### Option 2: Use Environment Variable

Add to `.env`:
```env
GEMINI_MODEL=gemini-1.5-flash
# or
GEMINI_MODEL=gemini-1.5-pro
```

Then update `gemini.js`:
```javascript
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
this.model = this.genAI.getGenerativeModel({ model: modelName });
```

## 📊 Performance Comparison

| Model | Speed | Quality | Cost | Use Case |
|-------|-------|---------|------|----------|
| gemini-1.5-flash | ⚡⚡⚡ | ⭐⭐⭐ | 💰 | Production, high volume |
| gemini-1.5-pro | ⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex queries, best quality |

## 🧪 Test After Update

```bash
# Test embeddings generation
npm run test:vector

# Test API
curl -X POST http://localhost:8080/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"test question"}'
```

## 🔍 Verify Models

Check available models:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  const models = await genAI.listModels();
  console.log('Available models:');
  models.forEach(model => {
    console.log(`- ${model.name}`);
    console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
  });
}

listModels();
```

## ⚠️ Quota & Rate Limits

### Free Tier Limits

**gemini-1.5-flash:**
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day (RPD)

**gemini-1.5-pro:**
- 2 requests per minute (RPM)
- 32,000 tokens per minute (TPM)
- 50 requests per day (RPD)

**text-embedding-004:**
- 1,500 requests per minute (RPM)

### If Hit Rate Limit

1. **Add delay between requests** (already implemented)
2. **Upgrade to paid plan**: https://ai.google.dev/pricing
3. **Use flash model** for higher RPM

## 💡 Best Practices

### 1. Use Flash for Production
```javascript
// Fast and cheap for most queries
model: 'gemini-1.5-flash'
```

### 2. Cache Responses
```javascript
// Cache common queries
const cache = new Map();
if (cache.has(query)) return cache.get(query);
```

### 3. Handle Rate Limits
```javascript
// Retry with exponential backoff
async function generateWithRetry(text, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generate(text);
    } catch (error) {
      if (error.message.includes('quota')) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Batch Processing
```javascript
// Process in batches to avoid rate limits
async function batchProcess(items, batchSize = 10) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(process));
    await sleep(4000); // 15 RPM = ~4s between batches
  }
}
```

## 🔗 References

- [Gemini Models Documentation](https://ai.google.dev/models/gemini)
- [Pricing](https://ai.google.dev/pricing)
- [API Reference](https://ai.google.dev/api)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/quota)

## 📝 Migration Checklist

- [x] Update text generation model to gemini-1.5-flash
- [x] Update embedding model to text-embedding-004
- [x] Add error handling for new response format
- [x] Test embeddings generation
- [x] Test API queries
- [ ] Monitor rate limits in production
- [ ] Consider caching strategy
- [ ] Upgrade API key if needed

---

**Updated**: 2025-10-29  
**Status**: ✅ Ready to use


