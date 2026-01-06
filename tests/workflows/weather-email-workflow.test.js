/**
 * Structural Validation Test Suite for Daily Weather Email Workflow
 * Tests workflow structure, configuration, and node relationships
 * Note: Does not execute workflows (n8n API doesn't support programmatic execution)
 */

const N8nClient = require('../helpers/n8n-client');
const validInputs = require('../fixtures/weather-email-workflow/valid-inputs.json');
const invalidInputs = require('../fixtures/weather-email-workflow/invalid-inputs.json');

// Workflow ID - update this with your actual workflow ID
const WORKFLOW_ID = 'mjMeOswPI3QYnbIv';

describe('Workflow: Daily Weather Email Report (PirateWeather)', () => {
  let n8nClient;
  let workflow;

  beforeAll(async () => {
    n8nClient = new N8nClient();

    // Fetch workflow details once for all tests
    workflow = await n8nClient.getWorkflowDetails(WORKFLOW_ID);
  });

  // ============================================================================
  // WORKFLOW METADATA TESTS
  // ============================================================================

  describe('Workflow Metadata', () => {
    test('should have correct workflow name', () => {
      expect(workflow.name).toBe('Daily Weather Email Report (PirateWeather)');
    });

    test('should have correct workflow ID', () => {
      expect(workflow.id).toBe(WORKFLOW_ID);
    });

    test('should have execution order v1', () => {
      expect(workflow.settings.executionOrder).toBe('v1');
    });

    test('should not be archived', () => {
      expect(workflow.isArchived).toBe(false);
    });
  });

  // ============================================================================
  // NODE STRUCTURE TESTS
  // ============================================================================

  describe('Node Structure', () => {
    const requiredNodes = [
      'Manual Trigger',
      'Schedule Trigger (Daily 7AM)',
      'Set Multiple Locations',
      'Parse & Split Locations',
      'Get Weather from PirateWeather',
      "Format Each Location's Weather",
      'Combine All Weather Reports',
      'Send Weather Email'
    ];

    test('should have all required nodes', () => {
      const nodeNames = workflow.nodes.map(node => node.name);

      requiredNodes.forEach(nodeName => {
        expect(nodeNames).toContain(nodeName);
      });
    });

    test('should have correct number of nodes (12 including sticky notes)', () => {
      expect(workflow.nodes.length).toBe(12);
    });

    test('should have 8 functional nodes', () => {
      const functionalNodes = workflow.nodes.filter(
        node => node.type !== 'n8n-nodes-base.stickyNote'
      );
      expect(functionalNodes.length).toBe(8);
    });

    test('should have 4 sticky notes for documentation', () => {
      const stickyNotes = workflow.nodes.filter(
        node => node.type === 'n8n-nodes-base.stickyNote'
      );
      expect(stickyNotes.length).toBe(4);
    });
  });

  // ============================================================================
  // TRIGGER NODES TESTS
  // ============================================================================

  describe('Trigger Nodes', () => {
    test('should have Manual Trigger node', () => {
      const manualTrigger = workflow.nodes.find(
        node => node.name === 'Manual Trigger'
      );

      expect(manualTrigger).toBeDefined();
      expect(manualTrigger.type).toBe('n8n-nodes-base.manualTrigger');
    });

    test('should have Schedule Trigger node', () => {
      const scheduleTrigger = workflow.nodes.find(
        node => node.name === 'Schedule Trigger (Daily 7AM)'
      );

      expect(scheduleTrigger).toBeDefined();
      expect(scheduleTrigger.type).toBe('n8n-nodes-base.scheduleTrigger');
    });

    test('Schedule Trigger should have daily 7AM cron expression', () => {
      const scheduleTrigger = workflow.nodes.find(
        node => node.name === 'Schedule Trigger (Daily 7AM)'
      );

      const cronExpression = scheduleTrigger.parameters.rule.interval[0].expression;
      expect(cronExpression).toBe('0 7 * * *');
    });
  });

  // ============================================================================
  // CONFIGURATION NODE TESTS
  // ============================================================================

  describe('Configuration Node', () => {
    let configNode;

    beforeAll(() => {
      configNode = workflow.nodes.find(
        node => node.name === 'Set Multiple Locations'
      );
    });

    test('should exist and be a Set node', () => {
      expect(configNode).toBeDefined();
      expect(configNode.type).toBe('n8n-nodes-base.set');
    });

    test('should have assignments for API key, units, and locations', () => {
      const assignments = configNode.parameters.assignments.assignments;
      const assignmentNames = assignments.map(a => a.name);

      expect(assignmentNames).toContain('apiKey');
      expect(assignmentNames).toContain('units');
      expect(assignmentNames).toContain('locations');
    });

    test('should have locations as a JSON string', () => {
      const assignments = configNode.parameters.assignments.assignments;
      const locationsAssignment = assignments.find(a => a.name === 'locations');

      expect(locationsAssignment).toBeDefined();
      expect(typeof locationsAssignment.value).toBe('string');

      // Should be valid JSON
      expect(() => JSON.parse(locationsAssignment.value)).not.toThrow();
    });

    test('locations should be an array when parsed', () => {
      const assignments = configNode.parameters.assignments.assignments;
      const locationsAssignment = assignments.find(a => a.name === 'locations');
      const locations = JSON.parse(locationsAssignment.value);

      expect(Array.isArray(locations)).toBe(true);
      expect(locations.length).toBeGreaterThan(0);
    });

    test('each location should have name, lat, and lon properties', () => {
      const assignments = configNode.parameters.assignments.assignments;
      const locationsAssignment = assignments.find(a => a.name === 'locations');
      const locations = JSON.parse(locationsAssignment.value);

      locations.forEach(location => {
        expect(location).toHaveProperty('name');
        expect(location).toHaveProperty('lat');
        expect(location).toHaveProperty('lon');
      });
    });
  });

  // ============================================================================
  // CODE NODE TESTS
  // ============================================================================

  describe('Code Nodes', () => {
    test('Parse & Split Locations should be a Code node', () => {
      const parseNode = workflow.nodes.find(
        node => node.name === 'Parse & Split Locations'
      );

      expect(parseNode).toBeDefined();
      expect(parseNode.type).toBe('n8n-nodes-base.code');
    });

    test('Parse & Split Locations should have JavaScript code', () => {
      const parseNode = workflow.nodes.find(
        node => node.name === 'Parse & Split Locations'
      );

      expect(parseNode.parameters.jsCode).toBeDefined();
      expect(parseNode.parameters.jsCode).toContain('JSON.parse');
      expect(parseNode.parameters.jsCode).toContain('locations');
    });

    test('Format Each Location\'s Weather should be a Code node', () => {
      const formatNode = workflow.nodes.find(
        node => node.name === "Format Each Location's Weather"
      );

      expect(formatNode).toBeDefined();
      expect(formatNode.type).toBe('n8n-nodes-base.code');
    });

    test('Format node should have weather formatting logic', () => {
      const formatNode = workflow.nodes.find(
        node => node.name === "Format Each Location's Weather"
      );

      const code = formatNode.parameters.jsCode;
      expect(code).toContain('currently');
      expect(code).toContain('temperature');
      expect(code).toContain('htmlBody');
      expect(code).toContain('weatherInfo');
    });

    test('Combine All Weather Reports should be a Code node', () => {
      const combineNode = workflow.nodes.find(
        node => node.name === 'Combine All Weather Reports'
      );

      expect(combineNode).toBeDefined();
      expect(combineNode.type).toBe('n8n-nodes-base.code');
    });

    test('Combine node should build subject line with location names', () => {
      const combineNode = workflow.nodes.find(
        node => node.name === 'Combine All Weather Reports'
      );

      const code = combineNode.parameters.jsCode;
      expect(code).toContain('subject');
      expect(code).toContain('locationCount');
      expect(code).toContain('Weather Report');
    });
  });

  // ============================================================================
  // HTTP REQUEST NODE TESTS
  // ============================================================================

  describe('HTTP Request Node', () => {
    let httpNode;

    beforeAll(() => {
      httpNode = workflow.nodes.find(
        node => node.name === 'Get Weather from PirateWeather'
      );
    });

    test('should exist and be an HTTP Request node', () => {
      expect(httpNode).toBeDefined();
      expect(httpNode.type).toBe('n8n-nodes-base.httpRequest');
    });

    test('should have PirateWeather API URL', () => {
      expect(httpNode.parameters.url).toContain('api.pirateweather.net');
      expect(httpNode.parameters.url).toContain('forecast');
    });

    test('should use expressions for dynamic values', () => {
      expect(httpNode.parameters.url).toContain('{{ $json.apiKey }}');
      expect(httpNode.parameters.url).toContain('{{ $json.lat }}');
      expect(httpNode.parameters.url).toContain('{{ $json.lon }}');
    });

    test('should have units query parameter', () => {
      expect(httpNode.parameters.sendQuery).toBe(true);
      const params = httpNode.parameters.queryParameters.parameters;
      const unitsParam = params.find(p => p.name === 'units');

      expect(unitsParam).toBeDefined();
      expect(unitsParam.value).toContain('{{ $json.units }}');
    });

    test('should have batching enabled with batch size 1', () => {
      expect(httpNode.parameters.options.batching).toBeDefined();
      expect(httpNode.parameters.options.batching.batch.batchSize).toBe(1);
    });
  });

  // ============================================================================
  // EMAIL NODE TESTS
  // ============================================================================

  describe('Email Node', () => {
    let emailNode;

    beforeAll(() => {
      emailNode = workflow.nodes.find(
        node => node.name === 'Send Weather Email'
      );
    });

    test('should exist and be an Email Send node', () => {
      expect(emailNode).toBeDefined();
      expect(emailNode.type).toBe('n8n-nodes-base.emailSend');
    });

    test('should have from and to email addresses', () => {
      expect(emailNode.parameters.fromEmail).toBeDefined();
      expect(emailNode.parameters.toEmail).toBeDefined();
    });

    test('should use expression for subject', () => {
      expect(emailNode.parameters.subject).toContain('{{ $json.subject }}');
    });

    test('should use expression for HTML body', () => {
      expect(emailNode.parameters.html).toContain('{{ $json.htmlBody }}');
    });

    test('should have SMTP credentials configured', () => {
      expect(emailNode.credentials).toBeDefined();
      expect(emailNode.credentials.smtp).toBeDefined();
    });
  });

  // ============================================================================
  // CONNECTION TESTS
  // ============================================================================

  describe('Node Connections', () => {
    test('Manual Trigger should connect to Set Multiple Locations', () => {
      const connection = workflow.connections['Manual Trigger'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Set Multiple Locations');
    });

    test('Schedule Trigger should connect to Set Multiple Locations', () => {
      const connection = workflow.connections['Schedule Trigger (Daily 7AM)'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Set Multiple Locations');
    });

    test('Set Multiple Locations should connect to Parse & Split Locations', () => {
      const connection = workflow.connections['Set Multiple Locations'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Parse & Split Locations');
    });

    test('Parse & Split Locations should connect to Get Weather', () => {
      const connection = workflow.connections['Parse & Split Locations'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Get Weather from PirateWeather');
    });

    test('Get Weather should connect to Format Each Location\'s Weather', () => {
      const connection = workflow.connections['Get Weather from PirateWeather'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe("Format Each Location's Weather");
    });

    test('Format should connect to Combine All Weather Reports', () => {
      const connection = workflow.connections["Format Each Location's Weather"];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Combine All Weather Reports');
    });

    test('Combine should connect to Send Weather Email', () => {
      const connection = workflow.connections['Combine All Weather Reports'];
      expect(connection).toBeDefined();
      expect(connection.main[0][0].node).toBe('Send Weather Email');
    });

    test('should have 7 connections total', () => {
      const connectionCount = Object.keys(workflow.connections).length;
      expect(connectionCount).toBe(7);
    });
  });

  // ============================================================================
  // STICKY NOTES TESTS
  // ============================================================================

  describe('Documentation Sticky Notes', () => {
    let stickyNotes;

    beforeAll(() => {
      stickyNotes = workflow.nodes.filter(
        node => node.type === 'n8n-nodes-base.stickyNote'
      );
    });

    test('should have Setup & Configuration sticky note', () => {
      const setupNote = stickyNotes.find(
        note => note.name === 'Setup & Configuration'
      );

      expect(setupNote).toBeDefined();
      expect(setupNote.parameters.content).toContain('SETUP & CONFIGURATION');
    });

    test('should have Data Fetch & Processing sticky note', () => {
      const processNote = stickyNotes.find(
        note => note.name === 'Data Fetch & Processing'
      );

      expect(processNote).toBeDefined();
      expect(processNote.parameters.content).toContain('DATA FETCH & PROCESSING');
    });

    test('should have Email Delivery sticky note', () => {
      const emailNote = stickyNotes.find(
        note => note.name === 'Email Delivery'
      );

      expect(emailNote).toBeDefined();
      expect(emailNote.parameters.content).toContain('EMAIL DELIVERY');
    });

    test('should have Workflow Overview sticky note', () => {
      const overviewNote = stickyNotes.find(
        note => note.name === 'Workflow Overview'
      );

      expect(overviewNote).toBeDefined();
      expect(overviewNote.parameters.content).toContain('WORKFLOW OVERVIEW');
    });

    test('sticky notes should have different colors', () => {
      const colors = stickyNotes.map(note => note.parameters.color);
      const uniqueColors = new Set(colors);

      expect(uniqueColors.size).toBeGreaterThan(1);
    });
  });

  // ============================================================================
  // DATA FLOW TESTS
  // ============================================================================

  describe('Data Flow Logic', () => {
    test('workflow should support multi-location processing', () => {
      const parseNode = workflow.nodes.find(
        node => node.name === 'Parse & Split Locations'
      );

      // Parse node should split locations array
      expect(parseNode.parameters.jsCode).toContain('map');
      expect(parseNode.parameters.jsCode).toContain('locationName');
    });

    test('workflow should process each location independently', () => {
      const httpNode = workflow.nodes.find(
        node => node.name === 'Get Weather from PirateWeather'
      );

      // Batching ensures each location is processed separately
      expect(httpNode.parameters.options.batching.batch.batchSize).toBe(1);
    });

    test('workflow should combine all location reports', () => {
      const combineNode = workflow.nodes.find(
        node => node.name === 'Combine All Weather Reports'
      );

      const code = combineNode.parameters.jsCode;
      expect(code).toContain('allReports');
      expect(code).toContain('locationCount');
      expect(code).toContain('combinedHtml');
    });

    test('email subject should handle different location counts', () => {
      const combineNode = workflow.nodes.find(
        node => node.name === 'Combine All Weather Reports'
      );

      const code = combineNode.parameters.jsCode;
      // Should have logic for 1, 2, 3, and 4+ locations
      expect(code).toContain('locationCount === 1');
      expect(code).toContain('locationCount === 2');
      expect(code).toContain('locationCount === 3');
    });
  });

  // ============================================================================
  // INPUT VALIDATION TESTS (Theoretical)
  // ============================================================================

  describe('Input Validation Scenarios', () => {
    test('should handle single location input', () => {
      const input = validInputs.singleLocation;

      expect(input.locations).toHaveLength(1);
      expect(input.locations[0]).toHaveProperty('name');
      expect(input.locations[0]).toHaveProperty('lat');
      expect(input.locations[0]).toHaveProperty('lon');
    });

    test('should handle multiple location input', () => {
      const input = validInputs.multipleLocations;

      expect(input.locations).toHaveLength(3);
      input.locations.forEach(loc => {
        expect(loc).toHaveProperty('name');
        expect(loc).toHaveProperty('lat');
        expect(loc).toHaveProperty('lon');
      });
    });

    test('should support different unit systems', () => {
      expect(validInputs.metricUnits.units).toBe('si');
      expect(validInputs.canadianUnits.units).toBe('ca');
      expect(validInputs.ukUnits.units).toBe('uk');
      expect(validInputs.singleLocation.units).toBe('us');
    });

    test('should define invalid input scenarios', () => {
      expect(invalidInputs.missingApiKey.apiKey).toBeUndefined();
      expect(invalidInputs.emptyLocations.locations).toHaveLength(0);
      expect(invalidInputs.malformedJson.locations).not.toBeInstanceOf(Array);
    });
  });

  // ============================================================================
  // API CONNECTIVITY TESTS
  // ============================================================================

  describe('API Connectivity', () => {
    test('should be able to fetch workflow details', async () => {
      const fetchedWorkflow = await n8nClient.getWorkflowDetails(WORKFLOW_ID);

      expect(fetchedWorkflow).toBeDefined();
      expect(fetchedWorkflow.id).toBe(WORKFLOW_ID);
    });

    test('should be able to check if workflow is active', async () => {
      const isActive = await n8nClient.isWorkflowActive(WORKFLOW_ID);

      expect(typeof isActive).toBe('boolean');
    });

    test('n8n client should have proper configuration', () => {
      expect(n8nClient.baseURL).toBeDefined();
      expect(n8nClient.apiKey).toBeDefined();
    });
  });
});
