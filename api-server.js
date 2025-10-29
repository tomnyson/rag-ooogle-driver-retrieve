#!/usr/bin/env node
/**
 * RAG API Server
 * Provides REST API endpoints for querying RAG system
 * 
 * Usage: npm run api
 *        API_PORT=8080 npm run api
 */

import express from 'express';
import cors from 'cors';
import { validateConfig } from './src/config/index.js';
import ragService from './src/services/rag.js';

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get RAG system statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await ragService.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

// Main RAG query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { query, options } = req.body;

    // Validate input
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Query must be a non-empty string'
      });
    }

    if (query.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Query too short',
        message: 'Query must be at least 3 characters long'
      });
    }

    // Process query
    const result = await ragService.query(query, options || {});

    // Option to exclude embeddings from response (for smaller payload)
    if (options?.excludeEmbeddings) {
      delete result.queryEmbedding;
      result.sources = result.sources.map(source => {
        const { embedding, ...rest } = source;
        return rest;
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Query error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Query failed',
      message: error.message
    });
  }
});

// Conversation endpoint (for chat-like interactions)
app.post('/api/chat', async (req, res) => {
  try {
    const { query, history, options } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Query must be a non-empty string'
      });
    }

    const result = await ragService.conversation(
      query,
      history || [],
      options || {}
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: error.message
    });
  }
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'RAG API',
    version: '1.0.0',
    description: 'REST API for querying RAG system with Google Drive documents',
    endpoints: {
      'GET /health': {
        description: 'Health check endpoint',
        response: 'System status'
      },
      'GET /api/stats': {
        description: 'Get RAG system statistics',
        response: 'Document count and system status'
      },
      'POST /api/query': {
        description: 'Query RAG system',
        body: {
          query: 'string (required) - Your question',
          options: {
            maxResults: 'number (optional, default: 5) - Max documents to retrieve',
            similarityThreshold: 'number (optional, default: 0.5) - Minimum similarity score',
            includeMetadata: 'boolean (optional, default: true) - Include document metadata',
            language: 'string (optional, default: "vi") - Response language (vi/en)'
          }
        },
        response: {
          answer: 'Generated answer',
          sources: 'Source documents',
          confidence: 'Confidence score',
          metadata: 'Query metadata'
        }
      },
      'POST /api/chat': {
        description: 'Chat with RAG system (conversation mode)',
        body: {
          query: 'string (required) - Your message',
          history: 'array (optional) - Conversation history',
          options: 'object (optional) - Same as /api/query options'
        },
        response: 'Same as /api/query'
      }
    },
    examples: {
      query: {
        url: 'POST /api/query',
        body: {
          query: 'Rau củ hữu cơ là gì?',
          options: {
            maxResults: 5,
            language: 'vi'
          }
        }
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    docs: '/api/docs'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Initialize and start server
async function startServer() {
  try {
    console.log('🚀 Starting RAG API Server...\n');
    console.log('='.repeat(60));

    // Validate configuration
    console.log('📋 Validating configuration...');
    validateConfig();
    console.log('✅ Configuration validated\n');

    // Initialize RAG service
    console.log('🔧 Initializing RAG service...');
    await ragService.initialize();
    console.log('✅ RAG service initialized\n');

    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('✅ RAG API Server is running!');
      console.log('='.repeat(60));
      console.log(`\n📡 Server: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('\n🔌 Endpoints:');
      console.log(`   POST http://localhost:${PORT}/api/query`);
      console.log(`   POST http://localhost:${PORT}/api/chat`);
      console.log(`   GET  http://localhost:${PORT}/api/stats`);
      console.log('\n💡 Example query:');
      console.log(`   curl -X POST http://localhost:${PORT}/api/query \\`);
      console.log(`        -H "Content-Type: application/json" \\`);
      console.log(`        -d '{"query":"Rau củ hữu cơ là gì?"}'`);
      console.log('\n⏹️  Press Ctrl+C to stop\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

