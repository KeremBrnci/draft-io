import { describe, expect, it } from 'vitest';

import { PlayerId } from '../../domain/value-objects/player-id.vo';

import { mapExternalPlayerPositions } from './map-external-player-positions';

const PLAYER_ID = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');

describe('mapExternalPlayerPositions', () => {
  it('creates a single primary assignment when provider returns one position', () => {
    const positions = mapExternalPlayerPositions(PLAYER_ID, {
      primaryPosition: 'RW',
      secondaryPositions: [],
    });

    expect(positions.count()).toBe(1);
    expect(positions.primaryCode).toBe('RW');
    expect(positions.assignments[0]?.isPrimary).toBe(true);
  });

  it('maps primary and additional provider positions', () => {
    const positions = mapExternalPlayerPositions(PLAYER_ID, {
      primaryPosition: 'CM',
      secondaryPositions: ['RM', 'RW'],
    });

    expect(positions.primaryCode).toBe('CM');
    expect(positions.secondaryCodes).toEqual(['RW']);
  });

  it('collapses overlapping wing and striker roles', () => {
    const positions = mapExternalPlayerPositions(PLAYER_ID, {
      primaryPosition: 'LB',
      secondaryPositions: ['Left Midfield', 'Left Winger'],
    });

    expect(positions.primaryCode).toBe('LB');
    expect(positions.secondaryCodes).toEqual(['LW']);
  });

  it('normalizes invalid provider shorthand before validation', () => {
    const positions = mapExternalPlayerPositions(PLAYER_ID, {
      primaryPosition: 'LEFT',
      secondaryPositions: ['RIGH'],
    });

    expect(positions.primaryCode).toBe('LW');
    expect(positions.secondaryCodes).toEqual(['RW']);
  });

  it('maps legacy migration shape primary + secondary array', () => {
    const positions = mapExternalPlayerPositions(PLAYER_ID, {
      primaryPosition: 'CB',
      secondaryPositions: ['LB', 'CDM'],
    });

    expect(positions.allCodes).toEqual(['CB', 'LB', 'CDM']);
    expect(positions.isPrimaryAt('CB')).toBe(true);
  });
});
