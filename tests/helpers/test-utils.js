/**
 * Test Utilities
 * Helper functions for workflow testing
 */

/**
 * Validate weather data structure
 */
function validateWeatherData(weatherData) {
  const errors = [];

  // Check required fields
  const requiredFields = ['location', 'coordinates', 'weatherInfo', 'htmlBody', 'temperature', 'conditions', 'timestamp'];
  requiredFields.forEach(field => {
    if (!(field in weatherData)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate data types
  if (typeof weatherData.temperature !== 'number') {
    errors.push('temperature should be a number');
  }

  if (typeof weatherData.weatherInfo !== 'string') {
    errors.push('weatherInfo should be a string');
  }

  if (typeof weatherData.htmlBody !== 'string') {
    errors.push('htmlBody should be a string');
  }

  // Validate HTML structure
  if (weatherData.htmlBody) {
    if (!weatherData.htmlBody.includes('<html>')) {
      errors.push('htmlBody should contain valid HTML structure');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate combined report structure
 */
function validateCombinedReport(report) {
  const errors = [];

  const requiredFields = ['weatherInfo', 'htmlBody', 'subject', 'locationCount', 'locations', 'timestamp'];
  requiredFields.forEach(field => {
    if (!(field in report)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (!Array.isArray(report.locations)) {
    errors.push('locations should be an array');
  }

  if (typeof report.locationCount !== 'number') {
    errors.push('locationCount should be a number');
  }

  if (report.locations && report.locationCount !== report.locations.length) {
    errors.push('locationCount does not match locations array length');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email subject format
 */
function validateSubjectFormat(subject, locationCount) {
  const errors = [];

  if (typeof subject !== 'string') {
    errors.push('subject should be a string');
    return { valid: false, errors };
  }

  if (!subject.includes('Weather Report')) {
    errors.push('subject should contain "Weather Report"');
  }

  // For 4+ locations, should have "+N more" format
  if (locationCount >= 4) {
    const morePattern = /\+\d+ more/;
    if (!morePattern.test(subject)) {
      errors.push('subject for 4+ locations should include "+N more" format');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Extract temperature values from weather info text
 */
function extractTemperatures(weatherInfo) {
  const tempRegex = /(\d+)°[FC]/g;
  const matches = weatherInfo.match(tempRegex);
  return matches ? matches.map(t => parseInt(t)) : [];
}

/**
 * Check if HTML is valid
 */
function isValidHTML(html) {
  const requiredTags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>'];
  return requiredTags.every(tag => html.includes(tag));
}

/**
 * Count occurrences of a substring
 */
function countOccurrences(str, substring) {
  return (str.match(new RegExp(substring, 'g')) || []).length;
}

/**
 * Validate coordinate format
 */
function validateCoordinates(lat, lon) {
  const errors = [];

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude)) {
    errors.push('Invalid latitude format');
  } else if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (isNaN(longitude)) {
    errors.push('Invalid longitude format');
  } else if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    valid: errors.length === 0,
    errors,
    latitude,
    longitude
  };
}

/**
 * Generate test location data
 */
function generateTestLocation(overrides = {}) {
  return {
    name: 'Test Location',
    lat: '40.7128',
    lon: '-74.0060',
    ...overrides
  };
}

/**
 * Generate test input data
 */
function generateTestInput(overrides = {}) {
  return {
    apiKey: 'test-api-key-12345',
    units: 'us',
    locations: [
      generateTestLocation()
    ],
    ...overrides
  };
}

/**
 * Wait for condition with timeout
 */
async function waitForCondition(conditionFn, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await conditionFn()) {
      return true;
    }
    await sleep(interval);
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Create mock API response
 */
function createMockWeatherResponse(overrides = {}) {
  return {
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    currently: {
      time: Math.floor(Date.now() / 1000),
      summary: 'Clear',
      icon: 'clear-day',
      temperature: 72,
      apparentTemperature: 70,
      humidity: 0.65,
      windSpeed: 8.5,
      windGust: 12.3,
      precipProbability: 0.15,
      cloudCover: 0.24,
      uvIndex: 3,
      visibility: 10,
      pressure: 1013,
      ...overrides.currently
    },
    hourly: {
      data: [
        { time: Math.floor(Date.now() / 1000), icon: 'clear-day', temperature: 72, summary: 'Clear' },
        { time: Math.floor(Date.now() / 1000) + 3600, icon: 'partly-cloudy-day', temperature: 73, summary: 'Partly Cloudy' },
        { time: Math.floor(Date.now() / 1000) + 7200, icon: 'partly-cloudy-day', temperature: 74, summary: 'Partly Cloudy' },
        { time: Math.floor(Date.now() / 1000) + 10800, icon: 'cloudy', temperature: 73, summary: 'Cloudy' },
        { time: Math.floor(Date.now() / 1000) + 14400, icon: 'rain', temperature: 71, summary: 'Light Rain' },
        { time: Math.floor(Date.now() / 1000) + 18000, icon: 'rain', temperature: 68, summary: 'Rain' }
      ],
      ...overrides.hourly
    },
    daily: {
      data: [
        {
          time: Math.floor(Date.now() / 1000),
          summary: 'Partly cloudy throughout the day.',
          icon: 'partly-cloudy-day',
          temperatureHigh: 78,
          temperatureHighTime: Math.floor(Date.now() / 1000) + 21600,
          temperatureLow: 62,
          temperatureLowTime: Math.floor(Date.now() / 1000) + 64800
        }
      ],
      ...overrides.daily
    },
    ...overrides
  };
}

/**
 * Assert execution successful
 */
function assertExecutionSuccessful(execution) {
  expect(execution).toBeDefined();
  expect(execution.finished).toBe(true);
  expect(execution.data.resultData.error).toBeUndefined();
}

/**
 * Get execution duration in milliseconds
 */
function getExecutionDuration(execution) {
  if (!execution.startedAt || !execution.finishedAt) {
    return null;
  }
  return new Date(execution.finishedAt) - new Date(execution.startedAt);
}

/**
 * Format execution metrics for logging
 */
function formatExecutionMetrics(execution) {
  return {
    id: execution.id,
    duration: getExecutionDuration(execution),
    finished: execution.finished,
    mode: execution.mode,
    startedAt: execution.startedAt,
    finishedAt: execution.finishedAt
  };
}

module.exports = {
  validateWeatherData,
  validateCombinedReport,
  validateSubjectFormat,
  extractTemperatures,
  isValidHTML,
  countOccurrences,
  validateCoordinates,
  generateTestLocation,
  generateTestInput,
  waitForCondition,
  sleep,
  deepClone,
  retryWithBackoff,
  createMockWeatherResponse,
  assertExecutionSuccessful,
  getExecutionDuration,
  formatExecutionMetrics
};
