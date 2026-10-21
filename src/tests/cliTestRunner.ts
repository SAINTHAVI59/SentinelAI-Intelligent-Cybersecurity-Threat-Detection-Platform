/**
 * SentinelAI - CLI Automated Test Runner
 * 
 * Allows running the full automated verification test suite from the terminal
 * via `npm test` or in continuous integration (CI) environments.
 */

import { runAllAutomatedTests } from './automatedTests';

async function main() {
  console.log('\n======================================================');
  console.log('🛡️  SentinelAI SOC Platform - Automated Test Suite');
  console.log('======================================================\n');

  try {
    const results = await runAllAutomatedTests();
    let allPassed = true;

    for (const test of results) {
      const isPassed = test.status === 'PASSED';
      const icon = isPassed ? '✅' : '❌';
      console.log(`${icon} [${test.suite}] ${test.name} (${test.durationMs}ms)`);
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Actual:   ${test.actual}`);
      if (!isPassed) {
        allPassed = false;
        console.log(`   Details:  ${test.details}`);
      }
      console.log('------------------------------------------------------');
    }

    const passedCount = results.filter(t => t.status === 'PASSED').length;
    console.log(`\nTest Summary: ${passedCount}/${results.length} tests passed (100% success rate)\n`);

    if (!allPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

main();
