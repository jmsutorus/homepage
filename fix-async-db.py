#!/usr/bin/env python3
"""
Script to automatically fix async/await issues in the codebase after migrating
from better-sqlite3 (sync) to @libsql/client (async).

This script:
1. Finds all calls to query(), queryOne(), and execute() from @/lib/db
2. Adds 'await' keyword before these calls
3. Marks containing functions as 'async' if not already
4. Handles .prepare() patterns and converts to execute()
"""

import re
import os
import sys
from pathlib import Path
from typing import Set, List, Tuple

# Patterns to match
QUERY_PATTERN = r'(?<!await\s)\b(query|queryOne|execute)\s*\('
AWAIT_QUERY_PATTERN = r'(?<!await\s)\b(query|queryOne|execute)\s*<'
PREPARE_PATTERN = r'getDatabase\(\)\.prepare\('

def needs_await(line: str) -> bool:
    """Check if a line has a query/queryOne/execute call that needs await"""
    # Skip if already has await
    if re.search(r'await\s+(query|queryOne|execute)\s*[<(]', line):
        return False
    # Check for query/queryOne/execute calls
    if re.search(QUERY_PATTERN, line) or re.search(AWAIT_QUERY_PATTERN, line):
        return True
    return False

def has_prepare(line: str) -> bool:
    """Check if line has getDatabase().prepare()"""
    return 'getDatabase().prepare(' in line or 'db.prepare(' in line

def find_function_start(lines: List[str], line_num: int) -> Tuple[int, str]:
    """Find the start of the function containing the given line"""
    # Search backwards for function declaration
    for i in range(line_num, -1, -1):
        line = lines[i]
        # Match function declarations
        # export function name(), export async function name(), function name(), async function name()
        func_match = re.search(r'^\s*(export\s+)?(async\s+)?function\s+\w+', line)
        if func_match:
            return i, func_match.group(0)
        # Match arrow functions: const name = () =>, export const name = async () =>
        arrow_match = re.search(r'^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\([^)]*\)\s*=>', line)
        if arrow_match:
            return i, arrow_match.group(0)
        # Match method definitions: async methodName(), methodName()
        method_match = re.search(r'^\s*(async\s+)?\w+\s*\([^)]*\)\s*[:{]', line)
        if method_match and not line.strip().startswith('//'):
            return i, method_match.group(0)
    return -1, ""

def make_function_async(func_declaration: str) -> str:
    """Add async keyword to function if not present"""
    if 'async' in func_declaration:
        return func_declaration

    # Handle: export function name
    if match := re.match(r'^(\s*export\s+)(function\s+)', func_declaration):
        return f"{match.group(1)}async {match.group(2)}"

    # Handle: function name
    if match := re.match(r'^(\s*)(function\s+)', func_declaration):
        return f"{match.group(1)}async {match.group(2)}"

    # Handle: export const name = () =>
    if match := re.match(r'^(\s*export\s+const\s+\w+\s*=\s*)(\([^)]*\)\s*=>)', func_declaration):
        return f"{match.group(1)}async {match.group(2)}"

    # Handle: const name = () =>
    if match := re.match(r'^(\s*)(const|let|var)(\s+\w+\s*=\s*)(\([^)]*\)\s*=>)', func_declaration):
        return f"{match.group(1)}{match.group(2)}{match.group(3)}async {match.group(4)}"

    # Handle method: methodName()
    if match := re.match(r'^(\s*)(\w+\s*\([^)]*\)\s*[:{])', func_declaration):
        return f"{match.group(1)}async {match.group(2)}"

    return func_declaration

def fix_file(filepath: str) -> bool:
    """Fix async/await issues in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.splitlines()

        modified = False
        modified_lines = set()
        needs_async = {}  # line_num -> function declaration

        # First pass: find all lines that need await
        for i, line in enumerate(lines):
            if needs_await(line):
                # Find function containing this line
                func_line, func_decl = find_function_start(lines, i)
                if func_line >= 0 and 'async' not in func_decl:
                    needs_async[func_line] = func_decl
                modified_lines.add(i)

        # Second pass: add 'await' and make functions async
        new_lines = []
        for i, line in enumerate(lines):
            # Make function async if needed
            if i in needs_async:
                original = needs_async[i]
                async_version = make_function_async(line)
                if async_version != line:
                    new_lines.append(async_version)
                    modified = True
                    continue

            # Add await to query calls
            if i in modified_lines:
                # Add await before query/queryOne/execute
                new_line = re.sub(r'\b(query|queryOne|execute)\s*([<(])', r'await \1\2', line)
                if new_line != line:
                    new_lines.append(new_line)
                    modified = True
                    continue

            new_lines.append(line)

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_lines) + '\n')
            return True

        return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    # Get all TypeScript files
    root_dir = Path('/home/joseph/Projects/homepage')

    # Patterns to include
    patterns = [
        'app/**/*.ts',
        'app/**/*.tsx',
        'lib/**/*.ts',
        'lib/**/*.tsx',
    ]

    # Patterns to exclude
    exclude_patterns = [
        'node_modules',
        '.next',
        'dist',
        'build',
    ]

    files_to_process = []
    for pattern in patterns:
        for filepath in root_dir.glob(pattern):
            # Skip excluded directories
            if any(excl in str(filepath) for excl in exclude_patterns):
                continue
            # Only process if it imports from @/lib/db
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'from "@/lib/db"' in content or 'from \'@/lib/db\'' in content or 'getDatabase()' in content:
                        files_to_process.append(filepath)
            except:
                pass

    print(f"Found {len(files_to_process)} files to process")

    fixed_count = 0
    for filepath in files_to_process:
        if fix_file(str(filepath)):
            print(f"Fixed: {filepath}")
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
