import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig.map((config) => {
    if (config.languageOptions?.parserOptions?.projectService) {
      const { projectService: _projectService, ...restParserOptions } =
        config.languageOptions.parserOptions;
      return {
        ...config,
        languageOptions: {
          ...config.languageOptions,
          parserOptions: {
            ...restParserOptions,
          },
        },
      };
    }
    return config;
  }),
  {
    ignores: ['dist/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/infrastructure/persistence/prisma-*.repository.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
