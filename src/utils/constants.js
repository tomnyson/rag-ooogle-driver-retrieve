/**
 * Application Constants
 * Central location for all magic numbers and strings
 */

/**
 * Supported file MIME types
 */
export const MIME_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  GOOGLE_DOC: 'application/vnd.google-apps.document',
  GOOGLE_FOLDER: 'application/vnd.google-apps.folder',
};

/**
 * Supported file types array
 */
export const SUPPORTED_MIME_TYPES = [
  MIME_TYPES.PDF,
  MIME_TYPES.DOCX,
  MIME_TYPES.DOC,
  MIME_TYPES.GOOGLE_DOC,
];

/**
 * File type mappings
 */
export const FILE_TYPE_MAP = {
  [MIME_TYPES.PDF]: 'pdf',
  [MIME_TYPES.DOCX]: 'docx',
  [MIME_TYPES.DOC]: 'doc',
  [MIME_TYPES.GOOGLE_DOC]: 'google-doc',
};

/**
 * API defaults
 */
export const API_DEFAULTS = {
  PORT: 3000,
  MAX_RESULTS: 5,
  SIMILARITY_THRESHOLD: 0.5,
  LANGUAGE: 'vi',
};

/**
 * Processing limits
 */
export const PROCESSING_LIMITS = {
  MAX_TEXT_LENGTH: 20000, // For embeddings
  MAX_SUMMARY_LENGTH: 500,
  MIN_TEXT_LENGTH: 10,
  CHUNK_SIZE: 5000,
  PAGE_SIZE: 1000, // For Google Drive API
  RATE_LIMIT_DELAY: 500, // ms between file processing
  BATCH_DELAY: 100, // ms between batch embedding requests
};

/**
 * Default cron schedule (2 AM daily)
 */
export const DEFAULT_CRON_SCHEDULE = '0 2 * * *';

/**
 * Google API scopes
 */
export const GOOGLE_SCOPES = {
  DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
};

/**
 * Gemini models
 */
export const GEMINI_MODELS = {
  CHAT: 'gemini-2.5-flash',
  EMBEDDING: 'text-embedding-004',
};

/**
 * Database table names
 */
export const DB_TABLES = {
  KNOWLEDGE_BASE: 'knowledge_base',
};

/**
 * Context building
 */
export const CONTEXT_LIMITS = {
  MAX_DOCUMENTS: 5,
  MAX_CONTENT_LENGTH: 2000, // chars per document in context
};

/**
 * Response messages
 */
export const MESSAGES = {
  NO_RELEVANT_DOCS_VI: 'Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn trong cơ sở dữ liệu.',
  NO_RELEVANT_DOCS_EN: 'Sorry, I could not find relevant information for your question in the database.',
  NO_FILES_FOUND: 'No files found to sync',
  CONFIG_VALIDATED: 'Configuration validated successfully',
  SHUTDOWN: 'Shutting down gracefully...',
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
};

/**
 * Log separators
 */
export const SEPARATORS = {
  HEAVY: '='.repeat(60),
  LIGHT: '─'.repeat(60),
};
