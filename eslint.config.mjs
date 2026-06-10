import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '@draft-io/**',
              group: 'external',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },
  {
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['apps/backend/src/modules/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/common',
              message: 'Application layer must not import NestJS. Use plain classes.',
            },
            {
              name: '@nestjs/core',
              message: 'Application layer must not import NestJS.',
            },
            {
              name: '@prisma/client',
              message: 'Application layer must not import Prisma.',
            },
          ],
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Application layer must not import infrastructure.',
            },
            {
              group: ['**/presentation/**'],
              message: 'Application layer must not import presentation.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/backend/src/modules/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@nestjs/common', message: 'Domain layer must not import NestJS.' },
            { name: '@nestjs/core', message: 'Domain layer must not import NestJS.' },
            { name: '@prisma/client', message: 'Domain layer must not import Prisma.' },
          ],
          patterns: [
            { group: ['**/infrastructure/**'], message: 'Domain must not import infrastructure.' },
            { group: ['**/presentation/**'], message: 'Domain must not import presentation.' },
            { group: ['**/application/**'], message: 'Domain must not import application.' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/backend/src/modules/**/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Presentation must not import infrastructure.',
            },
          ],
        },
      ],
    },
  },
);
