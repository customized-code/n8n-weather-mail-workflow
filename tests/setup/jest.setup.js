// Load environment variables from .env file
require('dotenv').config();

/**
 * Jest Setup Configuration
 * Global setup and teardown for all tests
 */

// Set test timeout
jest.setTimeout(30000);

// Environment variables setup
process.env.NODE_ENV = 'test';
process.env.N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
process.env.N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
process.env.TEST_TIMEOUT = process.env.TEST_TIMEOUT || '30000';

// Global test utilities
global.testUtils = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for condition');
  },

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random string
   */
  randomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
  },

  /**
   * Deep clone object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Check if object contains subset
   */
  objectContains(obj, subset) {
    for (const key in subset) {
      if (typeof subset[key] === 'object' && subset[key] !== null) {
        if (!this.objectContains(obj[key], subset[key])) {
          return false;
        }
      } else if (obj[key] !== subset[key]) {
        return false;
      }
    }
    return true;
  }
};

// Global beforeAll
beforeAll(async () => {
  console.log('🧪 Starting test suite...');
  console.log(`📡 n8n API URL: ${process.env.N8N_API_URL}`);
});

// Global afterAll
afterAll(async () => {
  console.log('✅ Test suite completed');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});
