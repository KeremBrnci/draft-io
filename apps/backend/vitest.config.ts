import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: [
        'src/modules/players/domain/**/*.ts',
        'src/modules/players/application/**/*.ts',
        'src/modules/positions/domain/**/*.ts',
        'src/modules/positions/application/**/*.ts',
        'src/modules/formations/domain/**/*.ts',
        'src/modules/formations/application/**/*.ts',
        'src/modules/teams/domain/**/*.ts',
        'src/modules/teams/application/**/*.ts',
        'src/modules/leagues/domain/entities/**',
        'src/modules/leagues/domain/value-objects/**',
        'src/modules/data-providers/domain/**/*.ts',
        'src/modules/data-providers/application/**/*.ts',
        'src/modules/overall-engine/domain/ports/**',
      ],
      exclude: [
        'src/**/*.unit.test.ts',
        'src/**/index.ts',
        'src/**/commands/**',
        'src/**/queries/**',
        'src/**/constants/**',
        'src/**/models/**',
        'src/**/repositories/**',
        'src/**/domain/ports/**',
        'src/**/enums/**',
        'src/**/domain/errors/**',
        'src/**/application/policies/**',
        'src/**/testing/**',
        'src/modules/players/domain/value-objects/player-name.vo.ts',
      ],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
