import { execSync } from 'child_process';

/**
 * Script to remove unused definitions and imports across the codebase.
 * It uses eslint-plugin-unused-imports to automatically fix:
 * - Unused imports
 * - Unused local variables
 */
async function main() {
  console.log('🚀 Starting code cleanup...');

  try {
    // 1. Run ESLint with fix for unused imports and vars
    console.log('🧹 Running ESLint to remove unused imports and variables...');
    // We run it twice because removing an import might reveal another unused variable or vice versa
    for (let i = 1; i <= 2; i++) {
      console.log(`   Iteration ${i}...`);
      try {
        execSync('npx eslint . --fix', { stdio: 'inherit' });
      } catch (e) {
        // ESLint exits with code 1 if there are still errors, which is common
      }
    }

    // 2. Run Knip to identify unused exports
    console.log('\n🔍 Checking for unused exports with Knip...');
    try {
      // Knip is better at finding unused exports/files/dependencies
      // We don't automatically remove these yet as they require more careful verification
      const knipResult = execSync('npx knip --reporter compact', { encoding: 'utf-8' });
      if (knipResult.trim()) {
        console.log('\nKnip found unused exports/files. Please review these manually:');
        console.log(knipResult);
      } else {
        console.log('✨ No unused exports found by Knip.');
      }
    } catch (e: any) {
        if (e.stdout) {
            console.log('\nKnip found unused code:');
            console.log(e.stdout);
        } else {
            console.error('❌ Knip failed to run:', e.message);
        }
    }

    console.log('\n✅ Cleanup complete! Please review the changes.');
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

main();
