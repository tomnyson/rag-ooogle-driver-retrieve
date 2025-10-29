/**
 * Custom Error Classes
 * Provides specific error types for better error handling
 */

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Configuration error (missing or invalid config)
 */
export class ConfigurationError extends AppError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}

/**
 * API error (external API failures)
 */
export class APIError extends AppError {
  constructor(message, service, details = null) {
    super(message, 502, details);
    this.service = service;
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}

/**
 * Validation error (invalid input)
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

/**
 * File processing error
 */
export class FileProcessingError extends AppError {
  constructor(message, fileName, details = null) {
    super(message, 500, details);
    this.fileName = fileName;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource, identifier = null) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404);
    this.resource = resource;
    this.identifier = identifier;
  }
}

/**
 * Handle errors in async functions
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Check if error is operational (expected)
 * @param {Error} error - Error to check
 * @returns {boolean} True if operational
 */
export function isOperationalError(error) {
  return error instanceof AppError && error.isOperational;
}
