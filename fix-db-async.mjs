#!/usr/bin/env node
/**
 * Automatically fix async/await issues after DB migration
 * Converts all function calls to query/queryOne/execute to use await
 * and makes containing functions async
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('{app,lib}/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/.next/**'],
});

let totalFixed = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');

  // Skip files that don't import from @/lib/db
  if (!content.includes('from "@/lib/db"') && !content.includes("from '@/lib/db'")) {
    continue;
  }

  let modified = false;
  let newContent = content;

  // Fix 1: Add await before query/queryOne/execute calls
  // Pattern: query( or queryOne( or execute( without await before it
  newContent = newContent.replace(
    /([^a-zA-Z_])(query|queryOne|execute)(<[^>]+>)?\(/g,
    (match, before, funcName, typeParam) => {
      // Check if there's already 'await' before this
      const lookBehind = newContent.substring(Math.max(0, newContent.indexOf(match) - 10), newContent.indexOf(match));
      if (lookBehind.includes('await')) {
        return match;
      }
      modified = true;
      return `${before}await ${funcName}${typeParam || ''}(`;
    }
  );

  // Fix 2: Make functions async if they call await
  const lines = newContent.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains await query/queryOne/execute
    if (line.includes('await query') || line.includes('await queryOne') || line.includes('await execute')) {
      // Find function declaration by looking backwards
      let funcLine = null;
      for (let j = i; j >= 0; j--) {
        const checkLine = lines[j];
        // Match various function patterns
        const funcPattern = /^(\s*)(export\s+)?(async\s+)?(function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*[:{])/;
        const match = checkLine.match(funcPattern);
        if (match && !checkLine.trim().startsWith('//')) {
          // Check if already async
          if (!checkLine.includes('async ')) {
            funcLine = j;
          }
          break;
        }
      }

      // Mark function as async
      if (funcLine !== null && !newLines[funcLine]?.includes('async ')) {
        const funcDeclLine = newLines[funcLine];
        // Add async after export if present, otherwise at start
        if (funcDeclLine.includes('export function')) {
          newLines[funcLine] = funcDeclLine.replace('export function', 'export async function');
          modified = true;
        } else if (funcDeclLine.match(/^(\s*)function\s+/)) {
          newLines[funcLine] = funcDeclLine.replace(/^(\s*)function\s+/, '$1async function ');
          modified = true;
        } else if (funcDeclLine.includes('const') && funcDeclLine.includes('=>')) {
          newLines[funcLine] = funcDeclLine.replace(/=\s*\(/, '= async (');
          modified = true;
        } else if (funcDeclLine.match(/^(\s*)\w+\s*\(/)) {
          newLines[funcLine] = funcDeclLine.replace(/^(\s*)(\w+\s*\()/, '$1async $2');
          modified = true;
        }
      }
    }

    newLines.push(line);
  }

  if (modified) {
    writeFileSync(file, newLines.join('\n'), 'utf-8');
    console.log(`Fixed: ${file}`);
    totalFixed++;
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);
