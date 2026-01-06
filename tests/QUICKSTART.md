# Quick Start Guide - n8n Weather Workflow Tests

Get up and running with the test suite in 5 minutes!

## Quick Setup (5 minutes)

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Configure Environment (2 min)

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get your n8n API key:
- Open your n8n instance: http://localhost:5678
- Go to **Settings** → **API**
- Click **Create API Key**
- Copy the key

3. Update `.env` file:
```bash
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=paste_your_key_here
```

### Step 3: Update Workflow ID (1 min)

1. Get your workflow ID from n8n URL:
- Open your workflow in n8n
- Copy the ID from URL: `http://localhost:5678/workflow/YOUR_WORKFLOW_ID`

2. Update in test file `tests/workflows/weather-email-workflow.test.js`:
```javascript
const WORKFLOW_ID = 'YOUR_WORKFLOW_ID'; // Line 14
```

### Step 4: Run Tests (1 min)

```bash
# Run all tests
npm test

# Or run in watch mode
npm run test:watch
```

## What You Should See

```
PASS tests/workflows/weather-email-workflow.test.js
Workflow: Daily Weather Email Report (PirateWeather)
should process single location successfully (5234ms)
should format weather data correctly (4891ms)
...

Test Suites: 1 passed, 1 total
Tests: 40 passed, 40 total
Time: 125.842s
```

## Common First-Run Issues

### Tests Timeout

**Problem**: All tests timeout

**Fix**: Make sure your n8n instance is running:
```bash
# Check if n8n is running
curl http://localhost:5678/healthz
```

### 401 Unauthorized

**Problem**: API authentication fails

**Fix**: Double-check your API key in `.env`

### Workflow Not Found

**Problem**: Can't find workflow

**Fix**: Verify the WORKFLOW_ID in the test file matches your workflow

## Test Coverage

After running tests, view coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Running Specific Tests

```bash
# Run only happy path tests
npm test -- --testNamePattern="Happy Path"

# Run a specific test
npm test -- -t "should process single location"

# Run with verbose output
npm run test:verbose
```

## Next Steps

1. **Read the full documentation**: [tests/README.md](README.md)
2. **Explore test fixtures**: Check `tests/fixtures/` for test data
3. **Write your first test**: Follow examples in the test suite
4. **Set up CI/CD**: Use the GitHub Actions example in README

## Need Help?

- Check [tests/README.md](README.md) for detailed documentation
- Review [Troubleshooting](README.md#-troubleshooting) section
- Look at existing tests for examples

## You're Ready!

You now have a fully functional test suite for your n8n workflow. Happy testing!

---

**Quick Commands Reference:**

```bash
npm test # Run all tests
npm run test:watch # Watch mode
npm run test:coverage # With coverage
npm run test:workflow # Workflow tests only
npm run test:verbose # Verbose output
```
