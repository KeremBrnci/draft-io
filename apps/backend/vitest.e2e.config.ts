import { mergeConfig } from 'vitest/config';

import vitestConfig from './vitest.config';

export default mergeConfig(vitestConfig, {
  test: {
    include: ['test/e2e/**/*.test.ts'],
  },
});
