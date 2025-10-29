/**
 * Service Container
 * Manages service instances with dependency injection
 */

import { config } from '../config/index.js';
import Logger from '../utils/logger.js';
import GeminiService from './gemini.js';
import GoogleDriveService from './googleDrive.js';
import SupabaseService from './supabase.js';
import FileProcessorService from './fileProcessor.js';
import RAGService from './rag.js';
import SyncService from '../sync.js';

/**
 * Service Container Class
 * Provides centralized service instantiation with dependency injection
 */
class ServiceContainer {
  constructor() {
    this.services = {};
    this.initialized = false;
  }

  /**
   * Initialize all services
   * @throws {Error} If initialization fails
   */
  async initialize() {
    if (this.initialized) {
      return this.services;
    }

    const rootLogger = new Logger('RAG');

    // Initialize file processor (no dependencies)
    this.services.fileProcessor = new FileProcessorService(
      rootLogger.child('FileProcessor')
    );

    // Initialize Gemini service
    this.services.gemini = new GeminiService(
      config.gemini.apiKey,
      rootLogger.child('Gemini')
    );
    await this.services.gemini.initialize();

    // Initialize Google Drive service
    this.services.googleDrive = new GoogleDriveService(
      config.google,
      rootLogger.child('GoogleDrive')
    );
    await this.services.googleDrive.initialize();

    // Initialize Supabase service
    this.services.supabase = new SupabaseService(
      config.supabase,
      rootLogger.child('Supabase')
    );
    await this.services.supabase.initialize();
    await this.services.supabase.setupDatabase();

    // Initialize RAG service (depends on gemini and supabase)
    this.services.rag = new RAGService(
      this.services.gemini,
      this.services.supabase,
      rootLogger.child('RAG')
    );
    await this.services.rag.initialize();

    // Initialize Sync service (depends on all services)
    this.services.sync = new SyncService(
      this.services.googleDrive,
      this.services.gemini,
      this.services.supabase,
      this.services.fileProcessor,
      config,
      rootLogger.child('Sync')
    );

    this.initialized = true;
    rootLogger.success('All services initialized successfully');
    
    return this.services;
  }

  /**
   * Get a specific service
   * @param {string} serviceName - Name of the service
   * @returns {*} Service instance
   * @throws {Error} If service not found
   */
  get(serviceName) {
    if (!this.initialized) {
      throw new Error('Service container not initialized. Call initialize() first.');
    }

    if (!this.services[serviceName]) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    return this.services[serviceName];
  }

  /**
   * Get all services
   * @returns {Object} All service instances
   */
  getAll() {
    if (!this.initialized) {
      throw new Error('Service container not initialized. Call initialize() first.');
    }

    return this.services;
  }
}

export default ServiceContainer;
