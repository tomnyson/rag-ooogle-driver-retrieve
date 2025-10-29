import { GoogleGenerativeAI } from '@google/generative-ai';
import Logger from '../utils/logger.js';
import { APIError } from '../utils/errors.js';
import { GEMINI_MODELS, PROCESSING_LIMITS } from '../utils/constants.js';
import { config } from '../config/index.js';

/**
 * Gemini AI Service
 * Handles AI operations including text generation and embeddings
 */
class GeminiService {
  /**
   * @param {string} apiKey - Gemini API key
   * @param {Logger} [logger] - Logger instance
   */
  constructor(apiKey, logger = null) {
    this.apiKey = apiKey;
    this.logger = logger || new Logger('GeminiService');
    this.genAI = null;
    this.model = null;
    this.embeddingModel = null;
    this.initialized = false;
  }

  /**
   * Initialize Gemini AI
   * @throws {APIError} If initialization fails
   */
  async initialize() {
    if (this.initialized) {
      this.logger.warn('Gemini AI already initialized');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: GEMINI_MODELS.CHAT });
      this.embeddingModel = this.genAI.getGenerativeModel({ model: GEMINI_MODELS.EMBEDDING });
      
      this.initialized = true;
      this.logger.success('Gemini AI initialized successfully');
      this.logger.info(`  Model: ${GEMINI_MODELS.CHAT}`);
      this.logger.info(`  Embedding: ${GEMINI_MODELS.EMBEDDING}`);
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI:', error.message);
      throw new APIError(
        'Failed to initialize Gemini AI',
        'Gemini',
        { originalError: error.message }
      );
    }
  }

  /**
   * Generate embeddings for text content
   * @param {string} text - Text to generate embeddings for
   * @returns {Promise<Array<number>>} Vector embeddings
   * @throws {APIError} If embedding generation fails
   */
  async generateEmbeddings(text) {
    if (!this.initialized) {
      throw new APIError('Gemini service not initialized', 'Gemini');
    }

    try {
      // Truncate text if too long
      const truncatedText = text.substring(0, PROCESSING_LIMITS.MAX_TEXT_LENGTH);
      
      const result = await this.embeddingModel.embedContent(truncatedText);
      
      // text-embedding-004 returns embeddings in result.embedding.values
      const embeddings = result.embedding?.values || result.embedding;
      
      if (!embeddings || !Array.isArray(embeddings)) {
        throw new Error('Invalid embedding format received from API');
      }
      
      this.logger.info(`Generated embeddings with ${embeddings.length} dimensions`);
      return embeddings;
    } catch (error) {
      this.logger.error('Error generating embeddings:', error.message);
      throw new APIError(
        'Failed to generate embeddings',
        'Gemini',
        { originalError: error.message, textLength: text.length }
      );
    }
  }

  /**
   * Extract and summarize text content
   * @param {string} text - Text to summarize
   * @param {number} [maxLength=500] - Maximum length of summary
   * @returns {Promise<string>} Summarized text
   * @throws {APIError} If summarization fails
   */
  async summarizeText(text, maxLength = PROCESSING_LIMITS.MAX_SUMMARY_LENGTH) {
    if (!this.initialized) {
      throw new APIError('Gemini service not initialized', 'Gemini');
    }

    try {
      if (text.length <= maxLength) {
        return text;
      }

      const prompt = `Summarize the following text in Vietnamese, keeping the main points and important information. Maximum ${maxLength} characters:\n\n${text.substring(0, 10000)}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();
      
      this.logger.info(`Generated summary (${summary.length} characters)`);
      return summary;
    } catch (error) {
      this.logger.error('Error summarizing text:', error.message);
      // Return truncated text if summarization fails
      return text.substring(0, maxLength);
    }
  }

  /**
   * Generate embeddings in batches for large texts
   * @param {Array<string>} textChunks - Array of text chunks
   * @returns {Promise<Array<Array<number>>>} Array of embeddings
   * @throws {APIError} If batch embedding generation fails
   */
  async generateBatchEmbeddings(textChunks) {
    if (!this.initialized) {
      throw new APIError('Gemini service not initialized', 'Gemini');
    }

    try {
      const embeddings = [];
      
      for (const chunk of textChunks) {
        const embedding = await this.generateEmbeddings(chunk);
        embeddings.push(embedding);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, PROCESSING_LIMITS.BATCH_DELAY));
      }
      
      return embeddings;
    } catch (error) {
      this.logger.error('Error generating batch embeddings:', error.message);
      throw new APIError(
        'Failed to generate batch embeddings',
        'Gemini',
        { originalError: error.message, chunksCount: textChunks.length }
      );
    }
  }

  /**
   * Split text into chunks for processing
   * @param {string} text - Text to split
   * @param {number} [chunkSize=5000] - Size of each chunk
   * @returns {Array<string>} Array of text chunks
   */
  splitTextIntoChunks(text, chunkSize = PROCESSING_LIMITS.CHUNK_SIZE) {
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    
    this.logger.info(`Split text into ${chunks.length} chunks`);
    return chunks;
  }
}

// Export singleton instance for backward compatibility
const logger = new Logger('Gemini');
export default new GeminiService(config.gemini.apiKey, logger);

