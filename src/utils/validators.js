/**
 * Input Validation Utilities
 * Provides validation helpers for API inputs and service methods
 */

import { ValidationError } from './errors.js';

/**
 * Validate required string
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} minLength - Minimum length
 * @throws {ValidationError} If validation fails
 */
export function validateRequiredString(value, fieldName, minLength = 1) {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
  
  if (value.trim().length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} character(s) long`
    );
  }
}

/**
 * Validate number in range
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @throws {ValidationError} If validation fails
 */
export function validateNumber(value, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }
  
  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`
    );
  }
}

/**
 * Validate array
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} minLength - Minimum array length
 * @throws {ValidationError} If validation fails
 */
export function validateArray(value, fieldName, minLength = 0) {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${minLength} element(s)`
    );
  }
}

/**
 * Validate object
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @throws {ValidationError} If validation fails
 */
export function validateObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`);
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {ValidationError} If validation fails
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

/**
 * Validate query options
 * @param {Object} options - Query options to validate
 * @returns {Object} Validated and sanitized options
 */
export function validateQueryOptions(options = {}) {
  const validated = {
    maxResults: 5,
    similarityThreshold: 0.5,
    includeMetadata: true,
    language: 'vi',
  };

  if (options.maxResults !== undefined) {
    validateNumber(options.maxResults, 'maxResults', 1, 100);
    validated.maxResults = options.maxResults;
  }

  if (options.similarityThreshold !== undefined) {
    validateNumber(options.similarityThreshold, 'similarityThreshold', 0, 1);
    validated.similarityThreshold = options.similarityThreshold;
  }

  if (options.includeMetadata !== undefined) {
    if (typeof options.includeMetadata !== 'boolean') {
      throw new ValidationError('includeMetadata must be a boolean');
    }
    validated.includeMetadata = options.includeMetadata;
  }

  if (options.language !== undefined) {
    if (!['vi', 'en'].includes(options.language)) {
      throw new ValidationError('language must be either "vi" or "en"');
    }
    validated.language = options.language;
  }

  if (options.excludeEmbeddings !== undefined) {
    if (typeof options.excludeEmbeddings !== 'boolean') {
      throw new ValidationError('excludeEmbeddings must be a boolean');
    }
    validated.excludeEmbeddings = options.excludeEmbeddings;
  }

  return validated;
}

/**
 * Sanitize string input
 * @param {string} value - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}
