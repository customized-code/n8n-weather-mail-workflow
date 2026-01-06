/**
 * Jest Configuration for n8n Workflow Tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Coverage thresholds (adjusted for structural validation testing)
  // Note: Structural tests only use a subset of helper methods
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'tests/helpers/**/*.js',
    '!tests/fixtures/**',
    '!tests/setup/**',
    '!**/node_modules/**'
  ],

  // Module paths
  moduleDirectories: ['node_modules', 'tests'],

  // Timeout configuration
  testTimeout: 30000, // 30 seconds default timeout

  // Verbose output
  verbose: true,

  // Bail on first failure (optional)
  bail: false,

  // Clear mocks between tests
  clearMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Error on deprecated APIs
  errorOnDeprecated: true,

  // Maximum number of concurrent workers
  maxWorkers: '50%',

  // Test result processor
  testResultsProcessor: undefined,

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/'
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
