import { describe, expect, it } from 'vitest';

import { createPaginationMeta } from './paginated-response.js';

describe('createPaginationMeta', () => {
  it('calculates pagination for first page', () => {
    const meta = createPaginationMeta({ page: 1, pageSize: 10 }, 25);

    expect(meta).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it('calculates pagination for last page', () => {
    const meta = createPaginationMeta({ page: 3, pageSize: 10 }, 25);

    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPreviousPage).toBe(true);
  });
});
