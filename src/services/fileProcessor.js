import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import Logger from '../utils/logger.js';
import { FileProcessingError } from '../utils/errors.js';
import { MIME_TYPES, FILE_TYPE_MAP, PROCESSING_LIMITS } from '../utils/constants.js';

/**
 * File Processor Service
 * Handles text extraction from various file formats
 */
class FileProcessorService {
  /**
   * @param {Logger} [logger] - Logger instance
   */
  constructor(logger = null) {
    this.logger = logger || new Logger('FileProcessor');
  }

  /**
   * Extract text content from a file buffer based on its type
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} mimeType - MIME type of the file
   * @param {string} fileName - Name of the file
   * @returns {Promise<string>} Extracted text content
   * @throws {FileProcessingError} If extraction fails
   */
  async extractText(fileBuffer, mimeType, fileName) {
    try {
      let text = '';

      switch (mimeType) {
        case MIME_TYPES.PDF:
          text = await this.extractFromPDF(fileBuffer);
          break;

        case MIME_TYPES.DOCX:
        case MIME_TYPES.DOC:
        case MIME_TYPES.GOOGLE_DOC:
          text = await this.extractFromWord(fileBuffer);
          break;

        default:
          this.logger.warn(`Unsupported file type: ${mimeType}`);
          text = '';
      }

      this.logger.info(`Extracted ${text.length} characters from ${fileName}`);
      return text;
    } catch (error) {
      this.logger.error(`Error extracting text from ${fileName}:`, error.message);
      throw new FileProcessingError(
        `Failed to extract text from ${fileName}`,
        fileName,
        { mimeType, originalError: error.message }
      );
    }
  }

  /**
   * Extract text from PDF file
   * @param {Buffer} fileBuffer - PDF file buffer
   * @returns {Promise<string>} Extracted text
   * @throws {FileProcessingError} If PDF parsing fails
   */
  async extractFromPDF(fileBuffer) {
    try {
      const data = await pdf(fileBuffer);
      return data.text;
    } catch (error) {
      this.logger.error('Error parsing PDF:', error.message);
      throw new FileProcessingError(
        'Failed to parse PDF file',
        'unknown',
        { originalError: error.message }
      );
    }
  }

  /**
   * Extract text from Word document (.doc, .docx)
   * @param {Buffer} fileBuffer - Word file buffer
   * @returns {Promise<string>} Extracted text
   * @throws {FileProcessingError} If Word document parsing fails
   */
  async extractFromWord(fileBuffer) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value;
    } catch (error) {
      this.logger.error('Error parsing Word document:', error.message);
      throw new FileProcessingError(
        'Failed to parse Word document',
        'unknown',
        { originalError: error.message }
      );
    }
  }

  /**
   * Clean and normalize text
   * @param {string} text - Raw text
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  /**
   * Get file type from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File type
   */
  getFileType(mimeType) {
    return FILE_TYPE_MAP[mimeType] || 'unknown';
  }

  /**
   * Validate text content
   * @param {string} text - Text to validate
   * @param {number} [minLength=10] - Minimum text length
   * @returns {boolean} True if valid
   */
  isValidText(text, minLength = PROCESSING_LIMITS.MIN_TEXT_LENGTH) {
    return text && text.trim().length >= minLength;
  }
}

// Export singleton instance
const logger = new Logger('FileProcessor');
export default new FileProcessorService(logger);