import { mergeConfig } from 'vitest/config';

import vitestConfig from './vitest.config';

export default mergeConfig(vitestConfig, {
  test: {
    include: ['src/**/*.unit.test.ts', 'test/**/*.unit.test.ts'],
  },
});
