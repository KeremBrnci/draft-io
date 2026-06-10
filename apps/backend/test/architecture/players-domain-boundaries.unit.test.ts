import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const DOMAIN_ROOT = join(process.cwd(), 'src/modules/players/domain');

function collectTsFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
      continue;
    }

    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.unit.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('players domain boundaries', () => {
  it('does not import data-providers module', () => {
    const violations: string[] = [];

    for (const filePath of collectTsFiles(DOMAIN_ROOT)) {
      const content = readFileSync(filePath, 'utf8');

      if (content.includes('data-providers')) {
        violations.push(filePath);
      }
    }

    expect(violations).toEqual([]);
  });
});
