/**
 * Patch Script: Fix Claude Agent SDK for Gemini Compatibility
 * This patches the EnterPlanMode tool schema to work with Vertex AI
 *
 * Run this as a RUN command in Dockerfile after installing the SDK
 */

const fs = require('fs');
const path = require('path');

// Path to the SDK's bundled CLI file
const CLI_PATH = '/opt/extra-modules/node_modules/@anthropic-ai/claude-agent-sdk/cli.js';

console.log('Patching Claude Agent SDK for Gemini compatibility...');

// Read the file
let cliCode = fs.readFileSync(CLI_PATH, 'utf-8');

console.log(`Original file size: ${cliCode.length} bytes`);

// Find and replace the EnterPlanMode schema
// Original: {"$schema":"https://json-schema.org/draft/2020-12/schema"}
// Fixed: {"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{}}

// The SDK likely has this pattern for EnterPlanMode
const originalSchema = '"$schema":"https://json-schema.org/draft/2020-12/schema"}';
const fixedSchema = '"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","properties":{},"additionalProperties":{}}';

// Count occurrences
const matches = cliCode.match(new RegExp(originalSchema.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
console.log(`Found ${matches ? matches.length : 0} instances of the pattern`);

// Replace all instances (there might be multiple tool definitions with this pattern)
const patchedCode = cliCode.replace(
  new RegExp(originalSchema.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
  fixedSchema
);

// Verify the patch was applied
if (patchedCode === cliCode) {
  console.log('WARNING: No changes made - pattern not found!');
  process.exit(1);
}

console.log(`Applied patch - modified ${cliCode.length - patchedCode.length} bytes`);

// Write the patched file
fs.writeFileSync(CLI_PATH, patchedCode, 'utf-8');

console.log('✓ Patch applied successfully');
console.log('EnterPlanMode schema now includes type:object and properties:{}');

// Verify the patch
const verify = fs.readFileSync(CLI_PATH, 'utf-8');
const hasFixedSchema = verify.includes(fixedSchema);

if (hasFixedSchema) {
  console.log('✓ Verification passed - patched schema found in file');
} else {
  console.log('✗ Verification failed - could not confirm patch');
  process.exit(1);
}
