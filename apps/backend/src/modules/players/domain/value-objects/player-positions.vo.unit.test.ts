import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import { Position } from '../../../positions/domain/value-objects/position.vo';
import { PlayerPosition } from '../entities/player-position.entity';
import {
  DuplicatePlayerPositionError,
  PlayerMultiplePrimaryPositionsError,
  PlayerPositionsRequiredError,
  PlayerPrimaryPositionRequiredError,
} from '../errors/player-position.errors';

import { PlayerId } from './player-id.vo';
import { PlayerPositionId } from './player-position-id.vo';
import { PlayerPositions } from './player-positions.vo';

const PLAYER_ID = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');

function nextId(): PlayerPositionId {
  return PlayerPositionId.generate(uuidv4());
}

function assignment(code: string, isPrimary: boolean): PlayerPosition {
  return PlayerPosition.create({
    id: nextId(),
    playerId: PLAYER_ID,
    position: Position.create(code),
    isPrimary,
  });
}

describe('PlayerPositions', () => {
  it('accepts one primary position', () => {
    const positions = PlayerPositions.fromAssignments([assignment('CDM', true)]);

    expect(positions.primaryCode).toBe('CDM');
    expect(positions.secondaryCodes).toEqual([]);
  });

  it('maps primary and secondary from import input', () => {
    const positions = PlayerPositions.fromPrimaryAndSecondary(PLAYER_ID, nextId, 'CM', [
      'RM',
      'RW',
    ]);

    expect(positions.primaryCode).toBe('CM');
    expect(positions.secondaryCodes).toEqual(['RM', 'RW']);
    expect(positions.count()).toBe(3);
  });

  it('deduplicates secondary codes that repeat primary', () => {
    const positions = PlayerPositions.fromPrimaryAndSecondary(PLAYER_ID, nextId, 'CM', [
      'CM',
      'RM',
    ]);

    expect(positions.allCodes).toEqual(['CM', 'RM']);
  });

  it('rejects empty position set', () => {
    expect(() => PlayerPositions.fromAssignments([])).toThrow(PlayerPositionsRequiredError);
  });

  it('rejects missing primary position', () => {
    expect(() =>
      PlayerPositions.fromAssignments([assignment('CM', false), assignment('RM', false)]),
    ).toThrow(PlayerPrimaryPositionRequiredError);
  });

  it('rejects multiple primary positions', () => {
    expect(() =>
      PlayerPositions.fromAssignments([assignment('CM', true), assignment('CDM', true)]),
    ).toThrow(PlayerMultiplePrimaryPositionsError);
  });

  it('rejects duplicate position codes', () => {
    expect(() =>
      PlayerPositions.fromAssignments([assignment('CM', true), assignment('CM', false)]),
    ).toThrow(DuplicatePlayerPositionError);
  });

  it('supports future draft eligibility checks', () => {
    const positions = PlayerPositions.fromPrimaryAndSecondary(PLAYER_ID, nextId, 'CDM', [
      'CM',
      'CB',
    ]);

    expect(positions.hasPosition('CDM')).toBe(true);
    expect(positions.isPrimaryAt('CDM')).toBe(true);
    expect(positions.hasPosition('CM')).toBe(true);
    expect(positions.isPrimaryAt('CM')).toBe(false);
  });
});
