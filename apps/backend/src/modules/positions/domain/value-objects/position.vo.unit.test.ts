import { describe, expect, it } from 'vitest';

import { InvalidPositionError } from '../errors/position.errors';

import { Position } from './position.vo';

describe('Position', () => {
  it('accepts all supported position codes', () => {
    expect(Position.create('GK').value).toBe('GK');
    expect(Position.create('LWB').value).toBe('LWB');
    expect(Position.create('CF').value).toBe('CF');
  });

  it('rejects unknown position codes', () => {
    expect(() => Position.create('INVALID')).toThrow(InvalidPositionError);
  });

  it('identifies goalkeepers', () => {
    expect(Position.create('GK').isGoalkeeper()).toBe(true);
    expect(Position.create('ST').isGoalkeeper()).toBe(false);
  });
});
