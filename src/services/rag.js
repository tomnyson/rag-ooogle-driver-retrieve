import geminiService from './gemini.js';
import supabaseService from './supabase.js';

class RAGService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize RAG service
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await geminiService.initialize();
      await supabaseService.initialize();
      this.initialized = true;
      console.log('✅ RAG Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RAG Service:', error.message);
      throw error;
    }
  }

  /**
   * Query RAG system with a question
   * @param {string} query - User's question
   * @param {Object} options - Query options
   * @returns {Object} Answer with sources
   */
  async query(query, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const {
        maxResults = 5,
        similarityThreshold = 0.5,
        includeMetadata = true,
        language = 'vi' // Vietnamese by default
      } = options;

      console.log(`\n🔍 RAG Query: "${query}"`);
      console.log('─'.repeat(60));

      // Step 1: Generate embedding for the query
      console.log('📊 Step 1: Generating query embedding...');
      const startEmbed = Date.now();
      const queryEmbedding = await geminiService.generateEmbeddings(query);
      const embedTime = Date.now() - startEmbed;
      console.log(`   ✓ Generated in ${embedTime}ms`);

      // Step 2: Search similar documents
      console.log('📚 Step 2: Searching similar documents...');
      const startSearch = Date.now();
      const similarDocs = await supabaseService.searchSimilarDocuments(
        queryEmbedding,
        maxResults
      );
      const searchTime = Date.now() - startSearch;
      console.log(`   ✓ Found ${similarDocs.length} documents in ${searchTime}ms`);

      // Filter by similarity threshold
      const relevantDocs = similarDocs.filter(
        doc => doc.similarity >= similarityThreshold
      );

      if (relevantDocs.length === 0) {
        console.log('⚠️  No relevant documents found');
        return {
          answer: language === 'vi' 
            ? 'Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn trong cơ sở dữ liệu.'
            : 'Sorry, I could not find relevant information for your question in the database.',
          sources: [],
          confidence: 0,
          metadata: {
            documentsFound: similarDocs.length,
            relevantDocuments: 0,
            processingTime: embedTime + searchTime
          }
        };
      }

      console.log(`   ✓ ${relevantDocs.length} relevant documents (threshold: ${similarityThreshold})`);

      // Step 3: Build context from relevant documents
      console.log('📝 Step 3: Building context...');
      const context = this.buildContext(relevantDocs, maxResults);
      console.log(`   ✓ Context built (${context.length} chars)`);

      // Step 4: Generate answer using Gemini
      console.log('🤖 Step 4: Generating answer with AI...');
      const startGen = Date.now();
      const answer = await this.generateAnswer(query, context, language);
      const genTime = Date.now() - startGen;
      console.log(`   ✓ Answer generated in ${genTime}ms`);

      // Step 5: Prepare response
      const sources = relevantDocs.map(doc => ({
        title: doc.title || doc.file_name,
        fileName: doc.file_name,
        fileType: doc.file_type,
        url: doc.file_url,
        similarity: doc.similarity,
        excerpt: doc.content.substring(0, 200) + '...',
        ...(includeMetadata && { 
          metadata: doc.metadata,
          embedding: doc.embedding // Include embedding vector
        })
      }));

      const avgSimilarity = relevantDocs.reduce((sum, doc) => sum + doc.similarity, 0) / relevantDocs.length;

      const response = {
        answer,
        sources,
        confidence: avgSimilarity,
        queryEmbedding: queryEmbedding, // Include query embedding for caching/reference
        metadata: {
          query,
          documentsFound: similarDocs.length,
          relevantDocuments: relevantDocs.length,
          processingTime: embedTime + searchTime + genTime,
          timings: {
            embedding: embedTime,
            search: searchTime,
            generation: genTime
          },
          embeddingDimensions: queryEmbedding.length
        }
      };

      console.log('✅ Query completed successfully');
      console.log(`   Confidence: ${(avgSimilarity * 100).toFixed(1)}%`);
      console.log('─'.repeat(60) + '\n');

      return response;
    } catch (error) {
      console.error('❌ RAG Query failed:', error.message);
      throw error;
    }
  }

  /**
   * Build context from relevant documents
   * @param {Array} documents - Relevant documents
   * @param {number} maxDocs - Maximum documents to include
   * @returns {string} Context string
   */
  buildContext(documents, maxDocs = 5) {
    const contextParts = documents
      .slice(0, maxDocs)
      .map((doc, index) => {
        return `
[Document ${index + 1}: ${doc.title || doc.file_name}]
${doc.content.substring(0, 2000)}
${doc.content.length > 2000 ? '...' : ''}
`;
      });

    return contextParts.join('\n---\n');
  }

  /**
   * Generate answer using Gemini with context
   * @param {string} query - User's question
   * @param {string} context - Context from documents
   * @param {string} language - Response language
   * @returns {string} Generated answer
   */
  async generateAnswer(query, context, language = 'vi') {
    try {
      const prompt = language === 'vi' ? `
Bạn là một trợ lý AI thông minh. Nhiệm vụ của bạn là trả lời câu hỏi của người dùng dựa trên thông tin được cung cấp.

NGUYÊN TẮC:
1. Chỉ sử dụng thông tin từ context được cung cấp
2. Trả lời chính xác, rõ ràng và súc tích
3. Nếu không có thông tin đủ để trả lời, hãy thành thật nói rằng bạn không biết
4. Trích dẫn tên tài liệu khi có thể
5. Trả lời bằng tiếng Việt

CONTEXT (Thông tin từ tài liệu):
${context}

CÂU HỎI: ${query}

TRẢ LỜI:
` : `
You are an intelligent AI assistant. Your task is to answer the user's question based on the provided information.

RULES:
1. Only use information from the provided context
2. Answer accurately, clearly, and concisely
3. If there's not enough information, honestly say you don't know
4. Cite document names when possible
5. Respond in English

CONTEXT (Information from documents):
${context}

QUESTION: ${query}

ANSWER:
`;

      const result = await geminiService.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('❌ Error generating answer:', error.message);
      throw error;
    }
  }

  /**
   * Get conversation-style response (with follow-up support)
   * @param {string} query - User's question
   * @param {Array} conversationHistory - Previous messages
   * @param {Object} options - Query options
   * @returns {Object} Answer with sources
   */
  async conversation(query, conversationHistory = [], options = {}) {
    // For now, just use regular query
    // In future, can maintain conversation context
    return this.query(query, options);
  }

  /**
   * Get statistics about RAG system
   * @returns {Object} Statistics
   */
  async getStatistics() {
    try {
      const stats = await supabaseService.getStatistics();
      return {
        totalDocuments: stats.totalDocuments,
        status: 'ready',
        initialized: this.initialized
      };
    } catch (error) {
      console.error('❌ Error getting statistics:', error.message);
      return {
        totalDocuments: 0,
        status: 'error',
        initialized: this.initialized
      };
    }
  }
}

export default new RAGService();

