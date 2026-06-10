import { describe, expect, it } from 'vitest';

import { ALL_POSITION_CODES } from '../../domain/value-objects/position.vo';

import { ListPositionsUseCase } from './list-positions.use-case';

describe('ListPositionsUseCase', () => {
  it('returns all position codes by default', () => {
    const useCase = new ListPositionsUseCase();
    expect(useCase.execute()).toEqual(ALL_POSITION_CODES);
  });

  it('returns only GK when goalkeeper filter is set', () => {
    const useCase = new ListPositionsUseCase();
    expect(useCase.execute({ includeGoalkeeperOnly: true })).toEqual(['GK']);
  });
});
