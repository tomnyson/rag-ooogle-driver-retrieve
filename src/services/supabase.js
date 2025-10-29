import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

class SupabaseService {
  constructor() {
    this.client = null;
  }

  /**
   * Initialize Supabase client
   */
  async initialize() {
    try {
      this.client = createClient(config.supabase.url, config.supabase.key);
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error.message);
      throw error;
    }
  }

  /**
   * Verify database setup
   */
  async setupDatabase() {
    try {
      console.log('⚠️  Make sure you have the knowledge_base table in Supabase');
      console.log('⚠️  Table should have been created already with your schema');
    } catch (error) {
      console.error('❌ Error setting up database:', error.message);
      throw error;
    }
  }

  /**
   * Upsert a document with its embedding to knowledge_base table
   * @param {Object} document - Document data
   * @returns {Object} Upserted document
   */
  async upsertDocument(document) {
    try {
      // Convert embedding array to jsonb array format
      const embeddingJsonb = document.embedding ? [document.embedding] : null;

      const recordData = {
        title: document.title || document.fileName,
        content: document.content,
        file_name: document.fileName,
        file_path: document.filePath || null,
        file_url: document.fileUrl,
        file_type: document.fileType,
        embedding: embeddingJsonb,
        metadata: document.metadata,
        chunk_index: document.chunkIndex || 0,
        teacher_id: document.teacherId || null,
        user_id: document.userId || null,
        updated_at: new Date().toISOString(),
      };

      // Check if document already exists by file_name or file_url
      const { data: existing, error: findError } = await this.client
        .from('knowledge_base')
        .select('id')
        .eq('file_name', document.fileName)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      let data, error;

      if (existing) {
        // Update existing record
        const result = await this.client
          .from('knowledge_base')
          .update(recordData)
          .eq('id', existing.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        const result = await this.client
          .from('knowledge_base')
          .insert(recordData)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }

      console.log(`💾 Upserted document: ${document.fileName}`);
      return data;
    } catch (error) {
      console.error(`❌ Error upserting document ${document.fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a document exists and if it needs updating
   * @param {string} fileName - File name
   * @param {string} modifiedTime - Last modified time from Google Drive
   * @returns {boolean} True if document needs updating
   */
  async needsUpdate(fileName, modifiedTime) {
    try {
      const { data, error } = await this.client
        .from('knowledge_base')
        .select('metadata, updated_at')
        .eq('file_name', fileName)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found
        throw error;
      }

      if (!data) {
        console.log(`📝 New file detected: ${fileName}`);
        return true; // Document doesn't exist, needs insert
      }

      // Check if file was modified in Google Drive
      const driveModifiedTime = new Date(modifiedTime);
      const storedModifiedTime = data.metadata?.modifiedTime 
        ? new Date(data.metadata.modifiedTime)
        : new Date(data.updated_at);

      const hasChanges = driveModifiedTime > storedModifiedTime;

      if (hasChanges) {
        console.log(`🔄 File modified: ${fileName}`);
        console.log(`   Drive: ${driveModifiedTime.toISOString()}`);
        console.log(`   Stored: ${storedModifiedTime.toISOString()}`);
      }

      return hasChanges;
    } catch (error) {
      console.error(`❌ Error checking document update status:`, error.message);
      return true; // If error, assume needs update
    }
  }

  /**
   * Search for similar documents using manual cosine similarity
   * Note: Since embedding is jsonb[], we need to implement similarity search differently
   * @param {Array<number>} queryEmbedding - Query embedding
   * @param {number} limit - Number of results to return
   * @returns {Array} Similar documents
   */
  async searchSimilarDocuments(queryEmbedding, limit = 10) {
    try {
      // Fetch all documents with embeddings
      const { data: allDocs, error } = await this.client
        .from('knowledge_base')
        .select('*')
        .not('embedding', 'is', null);

      if (error) {
        throw error;
      }

      // Calculate cosine similarity for each document
      const results = allDocs
        .map(doc => {
          if (!doc.embedding || doc.embedding.length === 0) {
            return null;
          }

          // Get the first embedding array (since it's stored as jsonb[])
          const docEmbedding = doc.embedding[0];
          
          // Calculate cosine similarity
          const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
          
          return {
            ...doc,
            similarity,
          };
        })
        .filter(doc => doc !== null && doc.similarity > 0.5) // Filter by threshold
        .sort((a, b) => b.similarity - a.similarity) // Sort by similarity desc
        .slice(0, limit); // Limit results

      console.log(`🔍 Found ${results.length} similar documents`);
      return results;
    } catch (error) {
      console.error('❌ Error searching similar documents:', error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} a - First vector
   * @param {Array<number>} b - Second vector
   * @returns {number} Cosine similarity (0 to 1)
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get statistics about stored documents
   * @returns {Object} Statistics
   */
  async getStatistics() {
    try {
      const { count, error } = await this.client
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return {
        totalDocuments: count,
      };
    } catch (error) {
      console.error('❌ Error getting statistics:', error.message);
      return { totalDocuments: 0 };
    }
  }

  /**
   * Delete a document by file name
   * @param {string} fileName - File name
   */
  async deleteDocument(fileName) {
    try {
      const { error } = await this.client
        .from('knowledge_base')
        .delete()
        .eq('file_name', fileName);

      if (error) {
        throw error;
      }

      console.log(`🗑️  Deleted document: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error deleting document:`, error.message);
      throw error;
    }
  }
}

export default new SupabaseService();

