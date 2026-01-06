#!/bin/bash

# Test Suite Setup Script
# Automated setup for n8n Weather Workflow test suite

set -e  # Exit on error

echo "🧪 n8n Weather Workflow Test Suite Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js >= 16.0.0 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version must be >= 16.0.0${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your n8n API credentials${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Check if n8n is running
echo "🔍 Checking n8n instance..."
N8N_URL="${N8N_API_URL:-http://localhost:5678}"
if curl -s -f "${N8N_URL}/healthz" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ n8n is running at ${N8N_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot reach n8n at ${N8N_URL}${NC}"
    echo "Make sure n8n is running before running tests"
fi
echo ""

# Verify test structure
echo "🗂️  Verifying test structure..."
REQUIRED_DIRS=(
    "tests/workflows"
    "tests/fixtures/weather-email-workflow"
    "tests/helpers"
    "tests/setup"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir${NC}"
    else
        echo -e "${RED}❌ Missing: $dir${NC}"
        exit 1
    fi
done
echo ""

# Check required files
echo "📄 Verifying required files..."
REQUIRED_FILES=(
    "tests/workflows/weather-email-workflow.test.js"
    "tests/helpers/n8n-client.js"
    "tests/helpers/test-utils.js"
    "tests/setup/jest.setup.js"
    "jest.config.js"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done
echo ""

# Count test fixtures
echo "🎯 Test fixtures summary..."
VALID_FIXTURES=$(jq 'keys | length' tests/fixtures/weather-email-workflow/valid-inputs.json 2>/dev/null || echo "N/A")
INVALID_FIXTURES=$(jq 'keys | length' tests/fixtures/weather-email-workflow/invalid-inputs.json 2>/dev/null || echo "N/A")
EDGE_FIXTURES=$(jq 'keys | length' tests/fixtures/weather-email-workflow/edge-cases.json 2>/dev/null || echo "N/A")

echo "  Valid input scenarios: ${VALID_FIXTURES}"
echo "  Invalid input scenarios: ${INVALID_FIXTURES}"
echo "  Edge case scenarios: ${EDGE_FIXTURES}"
echo ""

# Final instructions
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Update your .env file:"
echo "   ${YELLOW}nano .env${NC}"
echo "   - Set N8N_API_KEY to your actual API key"
echo "   - Verify N8N_API_URL is correct"
echo ""
echo "2. Update workflow ID in test file:"
echo "   ${YELLOW}nano tests/workflows/weather-email-workflow.test.js${NC}"
echo "   - Line 14: const WORKFLOW_ID = 'your_workflow_id'"
echo ""
echo "3. Run tests:"
echo "   ${GREEN}npm test${NC}                    # Run all tests"
echo "   ${GREEN}npm run test:watch${NC}          # Watch mode"
echo "   ${GREEN}npm run test:coverage${NC}       # With coverage"
echo ""
echo "4. View documentation:"
echo "   - Quick start: ${YELLOW}tests/QUICKSTART.md${NC}"
echo "   - Full docs: ${YELLOW}tests/README.md${NC}"
echo "   - Summary: ${YELLOW}TEST_SUITE_SUMMARY.md${NC}"
echo ""
echo "🎉 Happy testing!"
