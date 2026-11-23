import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const files = [...walk('src'), ...walk('tests')];
let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed++;
    console.error(`Syntax error in ${file}:\n${err.stderr?.toString()}`);
  }
}
if (failed > 0) process.exit(1);
console.log(`Syntax check passed for ${files.length} JS files.`);
