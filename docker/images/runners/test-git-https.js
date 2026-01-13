/**
 * Git HTTPS Protocol Test
 * Verifies git can clone repositories over HTTPS
 */

const { execSync } = require('child_process');
const fs = require('fs');

function exec(cmd, opts = {}) {
  return execSync(cmd, { ...opts, shell: '/bin/bash', encoding: 'utf-8' }).trim();
}

console.log('=== GIT HTTPS TEST ===\n');

// Test 1: Check git version
console.log('1. Git version:');
try {
  const version = exec('git --version');
  console.log(`   ✓ ${version}`);
} catch (e) {
  console.log(`   ✗ Failed: ${e.message}`);
}

// Test 2: Check if git-remote-https helper exists
console.log('\n2. Git HTTPS helper:');
const gitHelperPath = '/usr/libexec/git-core/git-remote-https';
if (fs.existsSync(gitHelperPath)) {
  console.log(`   ✓ ${gitHelperPath} exists`);
  const stat = fs.statSync(gitHelperPath);
  console.log(`      Size: ${stat.size} bytes`);
  console.log(`      Executable: ${(stat.mode & 0o111) !== 0}`);
} else {
  console.log(`   ✗ ${gitHelperPath} MISSING`);
  console.log('      This is why HTTPS cloning fails!');
}

// Test 3: List all git helpers present
console.log('\n3. Available git helpers:');
try {
  const helpers = exec('ls -1 /usr/libexec/git-core/ 2>/dev/null | grep "^git-remote-" || echo "none"');
  if (helpers === 'none') {
    console.log('   ✗ No remote helpers found');
  } else {
    console.log('   Helpers found:');
    helpers.split('\n').forEach(h => console.log(`      - ${h}`));
  }
} catch (e) {
  console.log(`   ✗ Cannot list helpers: ${e.message}`);
}

// Test 4: Check curl dependencies (git-remote-https needs libcurl)
console.log('\n4. Curl library (needed by git-remote-https):');
const curlLib = '/usr/lib/libcurl.so.4';
if (fs.existsSync(curlLib)) {
  console.log(`   ✓ ${curlLib} exists`);
} else {
  console.log(`   ✗ ${curlLib} MISSING`);
}

// Test 5: Try a minimal HTTPS clone
console.log('\n5. Test HTTPS clone (small repo):');
try {
  // Clean up any previous test
  exec('rm -rf /tmp/git-test-repo 2>/dev/null || true');

  // Try cloning a small repo
  const result = exec('git clone --depth 1 https://github.com/anthropics/anthropic-quickstarts /tmp/git-test-repo 2>&1', {
    timeout: 30000
  });

  console.log('   ✓ HTTPS clone successful!');
  console.log(`      Output: ${result.split('\n')[0]}`);

  // Clean up
  exec('rm -rf /tmp/git-test-repo');
} catch (e) {
  console.log('   ✗ HTTPS clone FAILED');
  console.log(`      Error: ${e.message}`);

  // Check if it's the remote-https error
  if (e.message.includes('remote-https') || e.message.includes("is not a git command")) {
    console.log('\n   DIAGNOSIS: git-remote-https helper is missing!');
    console.log('   This helper is required for HTTPS protocol support.');
  }
}

console.log('\n=== SUMMARY ===');
console.log('For git HTTPS cloning to work, you need:');
console.log('1. git binary (we have this)');
console.log('2. /usr/libexec/git-core/git-remote-https helper');
console.log('3. /usr/libexec/git-core/git-remote-http helper');
console.log('4. libcurl library (we have this)');

return { done: true };
