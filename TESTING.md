# n8n Weather Workflow Test Suite

**Author:** Roy Kim - Customized Code
**Last Updated:** 2026-01-05
**Version:** 2.0.0

Comprehensive structural validation test suite for the Daily Weather Email workflow.

## Table of Contents

- [What is Structural Validation Testing?](#what-is-structural-validation-testing)
- [Test Suite Overview](#test-suite-overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [What Gets Validated](#what-gets-validated)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## What is Structural Validation Testing?

**Structural validation testing** verifies the **structure and configuration** of your n8n workflow rather than testing its runtime execution.

### What Structural Tests DO

**Verify configuration exists and is correct** - Check that nodes have the right parameters, API URLs, email addresses, etc.
**Validate structure** - Confirm all required nodes are present, properly named, and of the correct type
**Check connections** - Ensure nodes are wired together in the correct data flow sequence
**Inspect code presence** - Verify that code nodes contain the expected logic (without executing it)
**Test metadata** - Validate workflow name, ID, settings, and other properties

### What Structural Tests DON'T DO

**Don't execute the workflow** - They never actually run your weather API calls or send emails
**Don't test runtime behavior** - They don't verify that the weather data comes back correctly or emails arrive
**Don't validate outputs** - They don't check if the HTML formatting works or if calculations are accurate

### Why We Use This Approach

The n8n public API doesn't provide a `/workflows/{id}/execute` endpoint for programmatic workflow execution. Workflows can only be executed by:

1. Activating the workflow and triggering it via its trigger node (webhook, schedule, etc.)
2. Manual execution through the n8n UI
3. Using production webhook/webhook-test endpoints

Therefore, this test suite uses **structural validation** to ensure your workflow is correctly configured without attempting to execute it.

### Example Comparison

```javascript
// STRUCTURAL TEST - checks configuration
test('should have PirateWeather API URL', () => {
const weatherNode = workflow.nodes.find(n => n.name === 'Get Weather from PirateWeather');
expect(weatherNode.parameters.url).toContain('api.pirateweather.net');
});

// NOT STRUCTURAL - would be an execution test (not possible with n8n API)
test('should return valid weather data', async () => {
const result = await executeWorkflow(WORKFLOW_ID, testInput);
expect(result.temperature).toBeGreaterThan(-50);
});
```

Think of it like **inspecting a recipe** (structural) vs **actually cooking the dish** (execution). The tests verify the recipe is complete and properly written, without actually making the meal.

## Test Suite Overview

### Current Statistics

- **Total Tests**: 56
- **Test Suites**: 12
- **All Tests**: Passing
- **Code Coverage**: ~6% (appropriate for structural validation)
- **Average Test Duration**: < 1 second
- **API Calls**: Only GET requests to fetch workflow details

### Test Categories

The test suite validates 12 major areas:

1. **Workflow Metadata** (4 tests) - Name, ID, settings, archive status
2. **Node Structure** (4 tests) - Correct nodes, counts, types
3. **Trigger Nodes** (3 tests) - Manual and schedule triggers, cron expressions
4. **Configuration Node** (6 tests) - Multi-location setup, API key, units
5. **Code Nodes** (6 tests) - Parsing, formatting, combining logic
6. **HTTP Request Node** (5 tests) - PirateWeather API configuration
7. **Email Node** (5 tests) - SMTP setup, subject, HTML body
8. **Node Connections** (8 tests) - Data flow between nodes
9. **Documentation Sticky Notes** (5 tests) - Annotations and colors
10. **Data Flow Logic** (4 tests) - Multi-location processing patterns
11. **Input Validation Scenarios** (4 tests) - Different input configurations
12. **API Connectivity** (3 tests) - n8n API access and authentication

## Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Running n8n instance** (local or remote)
- **n8n API key** with workflow read permissions

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `jest` - Testing framework
- `axios` - HTTP client for n8n API
- `dotenv` - Environment variable management
- Other dev dependencies

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```bash
# Required
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_actual_api_key_here

# Optional
N8N_WEBHOOK_URL=http://localhost:5678/webhook
TEST_TIMEOUT=30000
```

**For custom domains** (e.g., `n8n.customized.local`):
```bash
N8N_API_URL=http://n8n.customized.local:5678/api/v1
N8N_WEBHOOK_URL=http://n8n.customized.local:5678/webhook
```

### 3. Get Your n8n API Key

1. Open your n8n instance
2. Navigate to **Settings** → **API**
3. Click **Create API Key**
4. Copy the generated key
5. Paste it into your `.env` file as `N8N_API_KEY`

**Note**: API keys are JWT tokens that look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Find Your Workflow ID

1. Open your n8n instance
2. Navigate to the Daily Weather Email workflow
3. Check the URL - it will contain the workflow ID:
```
http://localhost:5678/workflow/mjMeOswPI3QYnbIv
^^^^^^^^^^^^^^^^
This is the ID
```

### 5. Update Test File with Workflow ID

Edit `tests/workflows/weather-email-workflow.test.js`:

```javascript
// Line 14 - Update this with your actual workflow ID
const WORKFLOW_ID = 'your_workflow_id_here';
```

### 6. Verify Setup

Test that everything is configured correctly:

```bash
npm test
```

If you see all tests passing, you're ready to go!

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only the workflow test
npm run test:workflow

# Run tests with verbose output
npm run test:verbose

# Run tests in CI mode (optimized for CI/CD)
npm run test:ci

# Debug tests with Chrome DevTools
npm run test:debug
```

### Running Specific Test Suites

```bash
# Run only workflow metadata tests
npm test -- --testNamePattern="Workflow Metadata"

# Run only node structure tests
npm test -- --testNamePattern="Node Structure"

# Run only connection tests
npm test -- --testNamePattern="Node Connections"

# Run only API connectivity tests
npm test -- --testNamePattern="API Connectivity"
```

### Running Individual Tests

```bash
# Run a specific test by name
npm test -- -t "should have correct workflow name"

# Run a specific test file
npm test tests/workflows/weather-email-workflow.test.js
```

### Viewing Coverage Reports

After running `npm run test:coverage`, open the HTML report:

```bash
# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

## Test Structure

### Directory Organization

```
tests/
workflows/
weather-email-workflow.test.js # Main test suite (56 tests)
helpers/
n8n-client.js # n8n API wrapper
test-utils.js # Test utility functions
fixtures/
weather-email-workflow/
valid-inputs.json # (Not used in structural tests)
invalid-inputs.json # (Not used in structural tests)
edge-cases.json # (Not used in structural tests)
setup/
jest.setup.js # Jest global configuration
```

**Note**: Fixture files are not currently used in structural validation tests but are preserved for potential future execution-based testing.

### Test File: weather-email-workflow.test.js

The main test file is organized into describe blocks for each test suite:

```javascript
describe('Workflow: Daily Weather Email Report (PirateWeather)', () => {
let n8nClient;
let workflow;

beforeAll(async () => {
// Fetch workflow details once for all tests
n8nClient = new N8nClient();
workflow = await n8nClient.getWorkflowDetails(WORKFLOW_ID);
});

describe('Workflow Metadata', () => {
// 4 tests validating workflow properties
});

describe('Node Structure', () => {
// 4 tests validating node existence and types
});

// ... 10 more test suites
});
```

## What Gets Validated

### 1. Workflow Metadata (4 tests)

- Workflow name: "Daily Weather Email Report (PirateWeather)"
- Workflow ID matches expected value
- Execution order set to v1
- Workflow is not archived

### 2. Node Structure (4 tests)

- All 12 required nodes exist (8 functional + 4 sticky notes)
- Correct node count
- Functional nodes vs documentation nodes
- Node types match expectations

### 3. Trigger Nodes (3 tests)

- Manual Trigger node exists
- Schedule Trigger exists with daily 7AM cron expression
- Trigger configuration correctness

### 4. Configuration Node (6 tests)

- Set node exists with correct type
- Assignments for API key, units, and locations
- Locations stored as JSON string
- Locations array parses correctly
- Each location has required properties (name, lat, lon)
- Multi-location support validation

### 5. Code Nodes (6 tests)

- Parse & Split Locations is a Code node with JavaScript
- Format Each Location's Weather has formatting logic
- Combine All Weather Reports has subject line building logic
- Code presence validation (not execution)

### 6. HTTP Request Node (5 tests)

- Node exists and is correct type
- PirateWeather API URL configured
- Uses n8n expressions for dynamic values
- Units query parameter present
- Batching enabled with batch size 1

### 7. Email Node (5 tests)

- Email Send node exists
- From and To email addresses configured
- Subject uses expression
- HTML body uses expression
- SMTP credentials configured

### 8. Node Connections (8 tests)

- Manual Trigger → Set Multiple Locations
- Schedule Trigger → Set Multiple Locations
- Set Multiple Locations → Parse & Split Locations
- Parse & Split Locations → Get Weather
- Get Weather → Format Each Location's Weather
- Format → Combine All Weather Reports
- Combine → Send Weather Email
- Total connection count = 7

### 9. Documentation Sticky Notes (5 tests)

- Setup & Configuration sticky note exists
- Data Fetch & Processing sticky note exists
- Email Delivery sticky note exists
- Workflow Overview sticky note exists
- Sticky notes have different colors

### 10. Data Flow Logic (4 tests)

- Multi-location processing support
- Independent location processing
- Report combining logic
- Email subject handles different location counts

### 11. Input Validation Scenarios (4 tests)

- Single location input handling
- Multiple location input handling
- Different unit systems support (us, si, ca, uk)
- Invalid input scenario definitions

### 12. API Connectivity (3 tests)

- Can fetch workflow details from n8n API
- Can check if workflow is active
- n8n client has proper configuration

## Troubleshooting

### Issue: Connection Refused (ECONNREFUSED)

**Error:**
```
n8n API Error in getWorkflowDetails: connect ECONNREFUSED ::1:5678
```

**Solutions:**
1. Verify n8n is running:
```bash
curl http://localhost:5678/healthz
# Should return: {"status":"ok"}
```
2. Check `N8N_API_URL` in `.env` matches your n8n instance
3. For custom domains, ensure DNS resolution works
4. Check firewall settings aren't blocking the connection

### Issue: API Authentication Failed (401 Unauthorized)

**Error:**
```
n8n API Error: 401 Unauthorized
```

**Solutions:**
1. Verify `N8N_API_KEY` in `.env` is correct
2. Regenerate API key in n8n Settings → API
3. Ensure API key hasn't expired
4. Check API key has workflow read permissions

### Issue: Workflow Not Found (404)

**Error:**
```
Workflow not found
```

**Solutions:**
1. Update `WORKFLOW_ID` in `tests/workflows/weather-email-workflow.test.js`
2. Verify workflow exists in n8n
3. Check workflow is not archived
4. Ensure API key has access to the workflow

### Issue: Environment Variables Not Loading

**Error:**
```
n8n API URL: http://localhost:5678/api/v1
```
(Shows localhost instead of your custom domain)

**Solutions:**
1. Verify `.env` file exists in project root
2. Check `dotenv` package is installed:
```bash
npm install --save-dev dotenv
```
3. Ensure `jest.setup.js` loads dotenv:
```javascript
require('dotenv').config();
```

### Issue: Coverage Thresholds Failing

**Error:**
```
Jest: "global" coverage threshold for statements (80%) not met: 6.12%
```

**Solution:**
This is expected for structural validation tests. The coverage is low because we only use a small subset of helper methods. Coverage thresholds are set to 5% in `jest.config.js`, which is appropriate for this testing approach.

### Issue: Tests Timeout

**Error:**
```
Timeout - Async callback was not invoked within the 30000ms timeout
```

**Solutions:**
1. Increase timeout in `jest.config.js`:
```javascript
testTimeout: 60000, // 60 seconds
```
2. Check n8n instance is responding quickly
3. Verify network connection is stable
4. Ensure n8n isn't overloaded with other executions

### Issue: Custom Domain Not Resolving

**Error:**
```
getaddrinfo ENOTFOUND n8n.customized.local
```

**Solutions:**
1. Add to `/etc/hosts`:
```
127.0.0.1 n8n.customized.local
```
2. Verify DNS configuration
3. Test domain resolution:
```bash
ping n8n.customized.local
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
push:
branches: [ main, develop ]
pull_request:
branches: [ main ]

jobs:
test:
runs-on: ubuntu-latest

services:
n8n:
image: n8nio/n8n:latest
env:
N8N_BASIC_AUTH_ACTIVE: false
N8N_ENCRYPTION_KEY: test-encryption-key
ports:
- 5678:5678

steps:
- uses: actions/checkout@v3

- name: Setup Node.js
uses: actions/setup-node@v3
with:
node-version: '18'
cache: 'npm'

- name: Install dependencies
run: npm ci

- name: Wait for n8n to be ready
run: |
timeout 60 bash -c 'until curl -f http://localhost:5678/healthz; do sleep 2; done'

- name: Import workflow to n8n
run: |
# Add script to import workflow and capture ID
# Set WORKFLOW_ID environment variable

- name: Run tests
env:
N8N_API_URL: http://localhost:5678/api/v1
N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
run: npm run test:ci

- name: Upload coverage
uses: codecov/codecov-action@v3
with:
file: ./coverage/lcov.info
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:
image: node:18
services:
- name: n8nio/n8n:latest
alias: n8n
variables:
N8N_API_URL: http://n8n:5678/api/v1
N8N_API_KEY: $CI_N8N_API_KEY
N8N_BASIC_AUTH_ACTIVE: "false"
before_script:
- npm ci
- until curl -f http://n8n:5678/healthz; do sleep 2; done
script:
- npm run test:ci
coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
artifacts:
reports:
coverage_report:
coverage_format: cobertura
path: coverage/cobertura-coverage.xml
```

### Jenkins Pipeline

```groovy
pipeline {
agent any

stages {
stage('Setup') {
steps {
sh 'npm ci'
}
}

stage('Start n8n') {
steps {
sh 'docker run -d --name n8n -p 5678:5678 -e N8N_BASIC_AUTH_ACTIVE=false n8nio/n8n:latest'
sh 'until curl -f http://localhost:5678/healthz; do sleep 2; done'
}
}

stage('Test') {
environment {
N8N_API_URL = 'http://localhost:5678/api/v1'
N8N_API_KEY = credentials('n8n-api-key')
}
steps {
sh 'npm run test:ci'
}
}
}

post {
always {
sh 'docker stop n8n && docker rm n8n'
junit 'coverage/junit.xml'
publishHTML([
reportDir: 'coverage/lcov-report',
reportFiles: 'index.html',
reportName: 'Coverage Report'
])
}
}
}
```

## Best Practices

### When to Add New Structural Tests

Add new tests when you:

- **Add new nodes** to the workflow
- **Modify node configurations** (API URLs, parameters, etc.)
- **Change workflow connections** or data flow
- **Add new sticky notes** or documentation
- **Update workflow settings** (execution order, etc.)

### Test Naming Conventions

- Use descriptive names that explain what is being tested
- Start with "should" for behavior tests
- Use present tense
- Be specific about the scenario

**Good examples:**
```javascript
test('should have correct workflow name', ...)
test('should connect Manual Trigger to Set Multiple Locations', ...)
test('should have PirateWeather API URL configured', ...)
```

**Bad examples:**
```javascript
test('test1', ...)
test('works', ...)
test('check', ...)
```

### Maintaining Test Coverage

For structural validation tests:

- **Coverage will be low** (~6%) because we only use a few helper methods
- **This is expected** - we're testing workflow structure, not helper code
- **Coverage thresholds** are set to 5% in `jest.config.js`
- **Focus on test count**, not coverage percentage

### Writing Clear Tests

```javascript
// Good - Clear and specific
test('should have Schedule Trigger with daily 7AM cron expression', () => {
const scheduleNode = workflow.nodes.find(n => n.name === 'Schedule Trigger (Daily 7AM)');
expect(scheduleNode.parameters.rule.interval[0].cronExpression).toBe('0 7 * * *');
});

// Bad - Vague and unclear
test('schedule works', () => {
const node = workflow.nodes[1];
expect(node.parameters.rule.interval[0].cronExpression).toBeDefined();
});
```

### Keep Tests Independent

Each test should be completely independent and not rely on the order of execution:

```javascript
// Good - Finds node explicitly
test('should have from email configured', () => {
const emailNode = workflow.nodes.find(n => n.name === 'Send Weather Email');
expect(emailNode.parameters.fromEmail).toBeDefined();
});

// Bad - Relies on test order or state
test('should have from email configured', () => {
expect(lastEmailNode.parameters.fromEmail).toBeDefined();
});
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [n8n API Documentation](https://docs.n8n.io/api/)
- [n8n Workflow Documentation](https://docs.n8n.io/workflows/)
- [Workflow README](README.md) - Main workflow documentation

## Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Update this TESTING.md if adding new test categories
3. Ensure all tests pass before committing
4. Keep tests independent and self-contained
5. Use clear, descriptive test names

## License

MIT - Copyright (c) 2026 Roy Kim

---

**Maintained by**: Roy Kim
**Test Suite Version**: 2.0.0
**Compatible with**: n8n 0.200.0+
