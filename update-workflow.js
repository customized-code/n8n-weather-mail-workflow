#!/usr/bin/env node
/**
 * Script to update the workflow JSON with new 7-day forecast code
 */

const fs = require('fs');
const path = require('path');

// Read the workflow JSON
const workflowPath = path.join(__dirname, 'weather-email-workflow.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Read the new code
const codePath = path.join(__dirname, 'format-weather-data-with-7day.js');
const newCode = fs.readFileSync(codePath, 'utf8');

// Find the Format Weather Data node
const formatNode = workflow.nodes.find(node => node.name === 'Format Weather Data');

if (!formatNode) {
  console.error('❌ Format Weather Data node not found!');
  process.exit(1);
}

// Update the jsCode parameter
formatNode.parameters.jsCode = newCode;

// Write the updated workflow back
fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));

console.log('✅ Workflow updated successfully with 7-day forecast code!');
console.log(`📝 Updated node: ${formatNode.name} (ID: ${formatNode.id})`);
