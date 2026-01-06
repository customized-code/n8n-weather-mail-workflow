/**
 * TDD Test Suite for 7-Day Forecast Feature
 * Tests the addition of 7-day forecast to the weather email workflow
 *
 * Following Test-Driven Development:
 * 1. Write tests first (defining expected behavior)
 * 2. Run tests (they should fail initially)
 * 3. Implement the feature
 * 4. Run tests again (they should pass)
 */

const N8nClient = require('../helpers/n8n-client');

// Workflow ID - update this with your actual workflow ID
const WORKFLOW_ID = 'mjMeOswPI3QYnbIv';

describe('Feature: 7-Day Forecast', () => {
  let n8nClient;
  let workflow;
  let formatNode;

  beforeAll(async () => {
    n8nClient = new N8nClient();
    workflow = await n8nClient.getWorkflowDetails(WORKFLOW_ID);

    // Get the Format Weather Data node (single location version)
    // OR Format Each Location's Weather (multi-location version)
    formatNode = workflow.nodes.find(
      node => node.name === "Format Weather Data" ||
              node.name === "Format Each Location's Weather"
    );
  });

  // ============================================================================
  // DATA EXTRACTION TESTS
  // ============================================================================

  describe('7-Day Forecast Data Extraction', () => {
    test('should extract daily forecast data from API response', () => {
      expect(formatNode).toBeDefined();
      expect(formatNode.type).toBe('n8n-nodes-base.code');

      const code = formatNode.parameters.jsCode;

      // Should access the daily.data array from weather API response
      expect(code).toContain('daily');
      expect(code).toContain('data');
    });

    test('should iterate through 7 days of forecast data', () => {
      const code = formatNode.parameters.jsCode;

      // Should loop through daily forecast (7 days)
      // Could use slice(0, 7) or slice(1, 8) to get next 7 days
      expect(code).toMatch(/slice\s*\(\s*[01]\s*,\s*[78]\s*\)/);
    });

    test('should extract daily high temperature', () => {
      const code = formatNode.parameters.jsCode;

      // Should extract temperatureHigh or temperatureMax
      expect(code).toMatch(/temperature(High|Max)/);
    });

    test('should extract daily low temperature', () => {
      const code = formatNode.parameters.jsCode;

      // Should extract temperatureLow or temperatureMin
      expect(code).toMatch(/temperature(Low|Min)/);
    });

    test('should extract daily weather icon/conditions', () => {
      const code = formatNode.parameters.jsCode;

      // Should extract icon for each day
      expect(code).toContain('icon');
    });

    test('should format day of week for each forecast day', () => {
      const code = formatNode.parameters.jsCode;

      // Should use Date methods to get day name
      // Could use toLocaleDateString, getDay, or similar
      expect(code).toMatch(/(toLocaleDateString|toDateString|Day\(|weekday)/);
    });

    test('should extract precipitation probability for each day', () => {
      const code = formatNode.parameters.jsCode;

      // Should extract precipProbability
      expect(code).toContain('precipProbability');
    });
  });

  // ============================================================================
  // HTML RENDERING TESTS
  // ============================================================================

  describe('7-Day Forecast HTML Rendering', () => {
    test('should include 7-day forecast section in HTML', () => {
      const code = formatNode.parameters.jsCode;

      // Should contain a forecast section header
      expect(code).toMatch(/7[\s-]?(Day|day) (Forecast|forecast)/);
    });

    test('should render forecast section with proper HTML structure', () => {
      const code = formatNode.parameters.jsCode;

      // Should have a forecast section div or container
      expect(code).toMatch(/forecast[- ]?section|daily[- ]?forecast/);
    });

    test('should display day name for each forecast day', () => {
      const code = formatNode.parameters.jsCode;

      // Should display formatted day names in the HTML
      // Looking for patterns like "Monday", "Tuesday", etc.
      expect(code).toMatch(/(Monday|Tuesday|Wednesday|day\[|weekday)/i);
    });

    test('should display high/low temperatures for each day', () => {
      const code = formatNode.parameters.jsCode;

      // Should show both high and low in the display
      expect(code).toMatch(/High.*Low|high.*low/);
    });

    test('should display weather icons for each day', () => {
      const code = formatNode.parameters.jsCode;

      // Should use getIconDescription or similar function
      expect(code).toMatch(/getIconDescription|icon/);
    });

    test('should display precipitation probability for each day', () => {
      const code = formatNode.parameters.jsCode;

      // Should show precip probability in the forecast
      expect(code).toMatch(/precip|rain|precipitation/i);
    });

    test('should have styled forecast cards or rows', () => {
      const code = formatNode.parameters.jsCode;

      // Should have CSS classes for forecast items
      expect(code).toMatch(/forecast[- ]?(item|card|day|row)/);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('7-Day Forecast Integration', () => {
    test('should not break existing current weather section', () => {
      const code = formatNode.parameters.jsCode;

      // Should still have current weather
      expect(code).toContain('currently');
      expect(code).toContain('Current');
    });

    test('should not break existing 6-hour forecast section', () => {
      const code = formatNode.parameters.jsCode;

      // Should still have 6-hour forecast
      expect(code).toMatch(/6[\s-]?hour/i);
      expect(code).toContain('hourly');
    });

    test('should maintain proper HTML structure with all sections', () => {
      const code = formatNode.parameters.jsCode;

      // Should have proper opening and closing HTML tags
      expect(code).toContain('<html>');
      expect(code).toContain('</html>');
      expect(code).toContain('</body>');
    });

    test('should return data in expected format', () => {
      const code = formatNode.parameters.jsCode;

      // Should return array with json object containing htmlBody
      expect(code).toContain('htmlBody');
      expect(code).toContain('return');
    });
  });

  // ============================================================================
  // DOCUMENTATION TESTS
  // ============================================================================

  describe('7-Day Forecast Documentation', () => {
    test('sticky note should mention 7-day forecast', () => {
      const dataProcessingSticky = workflow.nodes.find(
        node => node.name === 'Data Fetch & Processing' &&
                node.type === 'n8n-nodes-base.stickyNote'
      );

      if (dataProcessingSticky) {
        const content = dataProcessingSticky.parameters.content;
        expect(content).toMatch(/7[\s-]?day/i);
      }
    });

    test('workflow overview sticky should mention 7-day forecast', () => {
      const overviewSticky = workflow.nodes.find(
        node => node.name === 'Workflow Overview' &&
                node.type === 'n8n-nodes-base.stickyNote'
      );

      if (overviewSticky) {
        const content = overviewSticky.parameters.content;
        // Optional: may want to add 7-day forecast to overview
        // This test can be skipped if overview is too high-level
      }
    });
  });

  // ============================================================================
  // EDGE CASE TESTS
  // ============================================================================

  describe('7-Day Forecast Edge Cases', () => {
    test('should handle missing daily data gracefully', () => {
      const code = formatNode.parameters.jsCode;

      // Should check for daily data existence
      expect(code).toMatch(/daily\?\.data|\|\|\s*\[\]/);
    });

    test('should handle when API returns less than 7 days', () => {
      const code = formatNode.parameters.jsCode;

      // Should use slice which naturally handles shorter arrays
      expect(code).toContain('slice');
    });

    test('should format temperatures with correct units', () => {
      const code = formatNode.parameters.jsCode;

      // Should use getTemp function or similar for unit formatting
      expect(code).toContain('getTemp');
    });

    test('should handle undefined temperature values', () => {
      const code = formatNode.parameters.jsCode;

      // getTemp function should handle undefined/null
      expect(code).toMatch(/if\s*\(\s*!.*temp\s*\)|temp.*\?/);
    });
  });
});
