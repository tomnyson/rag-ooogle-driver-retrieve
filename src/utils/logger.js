/**
 * Centralized Logging Service
 * Provides consistent logging across the application
 */

class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  /**
   * Format timestamp
   * @returns {string} Formatted timestamp
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted message
   */
  _formatMessage(level, message) {
    const timestamp = this._getTimestamp();
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${prefix}${message}`;
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    console.log(this._formatMessage('info', message), ...args);
  }

  /**
   * Log success message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  success(message, ...args) {
    console.log('✅', this._formatMessage('success', message), ...args);
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    console.warn('⚠️ ', this._formatMessage('warn', message), ...args);
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  error(message, ...args) {
    console.error('❌', this._formatMessage('error', message), ...args);
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      console.log('🔍', this._formatMessage('debug', message), ...args);
    }
  }

  /**
   * Log separator
   * @param {string} char - Character to use for separator
   * @param {number} length - Length of separator
   */
  separator(char = '=', length = 60) {
    console.log(char.repeat(length));
  }

  /**
   * Create a child logger with prefix
   * @param {string} prefix - Prefix for child logger
   * @returns {Logger} Child logger instance
   */
  child(prefix) {
    return new Logger(this.prefix ? `${this.prefix}:${prefix}` : prefix);
  }
}

export default Logger;
