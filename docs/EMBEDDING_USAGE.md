# 🔢 Embedding Vector Usage Guide

Hướng dẫn sử dụng embedding vectors được return từ API.

## 📊 Response Format với Embeddings

### Query Response
```json
{
  "success": true,
  "data": {
    "answer": "Rau củ hữu cơ là...",
    "queryEmbedding": [0.012, -0.023, 0.034, ...], // 768 numbers
    "sources": [
      {
        "title": "Document 1",
        "similarity": 0.87,
        "embedding": [[0.045, -0.056, 0.067, ...]] // jsonb[] format
      }
    ],
    "confidence": 0.87,
    "metadata": {
      "embeddingDimensions": 768
    }
  }
}
```

## 🎯 Use Cases cho Embeddings

### 1. **Client-side Caching**

Cache query embeddings để tránh generate lại:

```javascript
// Cache embeddings
const cache = new Map();

async function queryWithCache(query) {
  // Check cache first
  if (cache.has(query)) {
    const cachedEmbedding = cache.get(query);
    // Use cached embedding for similar queries
    return searchWithEmbedding(cachedEmbedding);
  }
  
  // New query
  const response = await fetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  
  // Cache the embedding
  cache.set(query, data.data.queryEmbedding);
  
  return data;
}
```

### 2. **Similarity Comparison**

So sánh similarity giữa các queries:

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

// Compare two queries
const query1Embedding = [0.012, -0.023, ...];
const query2Embedding = [0.015, -0.028, ...];
const similarity = cosineSimilarity(query1Embedding, query2Embedding);

if (similarity > 0.9) {
  console.log('Queries are very similar!');
}
```

### 3. **Batch Processing**

Process nhiều documents với embeddings:

```javascript
async function batchSearch(queries) {
  const embeddings = [];
  
  // Generate embeddings for all queries
  for (const query of queries) {
    const response = await fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    embeddings.push({
      query,
      embedding: data.data.queryEmbedding,
      sources: data.data.sources
    });
  }
  
  return embeddings;
}
```

### 4. **Document Clustering**

Cluster documents dựa trên embeddings:

```javascript
async function clusterDocuments(queries) {
  const results = await batchSearch(queries);
  
  // Group similar documents
  const clusters = [];
  
  for (const result of results) {
    let foundCluster = false;
    
    for (const cluster of clusters) {
      const similarity = cosineSimilarity(
        result.embedding,
        cluster.centroid
      );
      
      if (similarity > 0.8) {
        cluster.items.push(result);
        foundCluster = true;
        break;
      }
    }
    
    if (!foundCluster) {
      clusters.push({
        centroid: result.embedding,
        items: [result]
      });
    }
  }
  
  return clusters;
}
```

### 5. **Semantic Search Enhancement**

Rerank results dựa trên custom logic:

```javascript
async function rerank(query, additionalContext) {
  const response = await fetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  const sources = data.data.sources;
  
  // Generate embedding for additional context
  const contextResponse = await fetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({ query: additionalContext })
  });
  
  const contextData = await contextResponse.json();
  const contextEmbedding = contextData.data.queryEmbedding;
  
  // Rerank based on combined similarity
  const reranked = sources.map(source => {
    const docEmbedding = source.embedding[0];
    const contextSimilarity = cosineSimilarity(
      contextEmbedding,
      docEmbedding
    );
    
    return {
      ...source,
      combinedScore: (source.similarity + contextSimilarity) / 2
    };
  }).sort((a, b) => b.combinedScore - a.combinedScore);
  
  return reranked;
}
```

## ⚡ Performance Optimization

### Exclude Embeddings (Smaller Payload)

Nếu không cần embeddings, exclude để giảm response size:

```javascript
const response = await fetch('/api/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "test",
    options: {
      excludeEmbeddings: true // Exclude embeddings from response
    }
  })
});
```

**Response size comparison:**
- With embeddings: ~200KB (768 numbers × 4 bytes × sources)
- Without embeddings: ~10KB (text only)

### Compress Embeddings

```javascript
// Use gzip compression
const pako = require('pako');

function compressEmbedding(embedding) {
  const buffer = new Float32Array(embedding).buffer;
  const compressed = pako.deflate(new Uint8Array(buffer));
  return Array.from(compressed);
}

function decompressEmbedding(compressed) {
  const decompressed = pako.inflate(new Uint8Array(compressed));
  return Array.from(new Float32Array(decompressed.buffer));
}
```

## 🎨 Visualization

### Visualize Embeddings với t-SNE

```python
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Get embeddings from API
embeddings = []
labels = []

for query in queries:
    response = requests.post('http://localhost:8080/api/query', 
                           json={'query': query})
    data = response.json()
    embeddings.append(data['data']['queryEmbedding'])
    labels.append(query)

# Reduce to 2D
embeddings_array = np.array(embeddings)
tsne = TSNE(n_components=2, random_state=42)
embeddings_2d = tsne.fit_transform(embeddings_array)

# Plot
plt.figure(figsize=(10, 8))
plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1])

for i, label in enumerate(labels):
    plt.annotate(label, (embeddings_2d[i, 0], embeddings_2d[i, 1]))

plt.title('Query Embeddings Visualization')
plt.show()
```

## 💾 Storage

### Store Embeddings in IndexedDB (Browser)

```javascript
// Open IndexedDB
const db = await openDB('embeddings-cache', 1, {
  upgrade(db) {
    db.createObjectStore('queries', { keyPath: 'query' });
  }
});

// Store embedding
async function cacheEmbedding(query, embedding) {
  await db.put('queries', {
    query,
    embedding,
    timestamp: Date.now()
  });
}

// Retrieve embedding
async function getCachedEmbedding(query) {
  const result = await db.get('queries', query);
  
  // Check if cache is fresh (< 1 hour old)
  if (result && Date.now() - result.timestamp < 3600000) {
    return result.embedding;
  }
  
  return null;
}
```

### Store in Redis (Backend)

```javascript
import Redis from 'ioredis';

const redis = new Redis();

// Cache embedding
async function cacheQueryEmbedding(query, embedding) {
  await redis.setex(
    `embedding:${query}`,
    3600, // TTL: 1 hour
    JSON.stringify(embedding)
  );
}

// Get cached embedding
async function getCachedQueryEmbedding(query) {
  const cached = await redis.get(`embedding:${query}`);
  return cached ? JSON.parse(cached) : null;
}
```

## 🔍 Advanced: Multi-Query Search

Search với multiple embeddings:

```javascript
async function multiQuerySearch(queries) {
  // Get embeddings for all queries
  const embeddings = await Promise.all(
    queries.map(async query => {
      const res = await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      return data.data.queryEmbedding;
    })
  );
  
  // Average embeddings
  const avgEmbedding = embeddings[0].map((_, i) => {
    const sum = embeddings.reduce((acc, emb) => acc + emb[i], 0);
    return sum / embeddings.length;
  });
  
  // Search with averaged embedding
  // (Would need custom endpoint for this)
  return avgEmbedding;
}
```

## 📊 Analytics

Track query patterns:

```javascript
const queryAnalytics = {
  queries: [],
  
  async track(query, embedding, result) {
    this.queries.push({
      query,
      embedding,
      timestamp: Date.now(),
      resultsCount: result.sources.length,
      confidence: result.confidence
    });
  },
  
  findSimilarQueries(query, threshold = 0.8) {
    const queryEmb = this.queries.find(q => q.query === query)?.embedding;
    if (!queryEmb) return [];
    
    return this.queries
      .filter(q => q.query !== query)
      .map(q => ({
        query: q.query,
        similarity: cosineSimilarity(queryEmb, q.embedding)
      }))
      .filter(q => q.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }
};
```

## 🎯 Best Practices

1. **Cache embeddings** để giảm API calls
2. **Compress** khi store hoặc transfer
3. **Set TTL** cho cached data
4. **Use excludeEmbeddings** khi chỉ cần answer
5. **Batch process** khi có nhiều queries
6. **Monitor size** của responses

## ⚠️ Considerations

- **Size**: 768 floats = ~3KB per embedding
- **Precision**: Float32 vs Float64
- **Storage**: IndexedDB (browser) hoặc Redis (server)
- **Transfer**: Compress nếu > 100 embeddings
- **Cache**: Set appropriate TTL

---

**See also:**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Full API docs
- [VECTOR_PROCESSING.md](VECTOR_PROCESSING.md) - Vector processing details


