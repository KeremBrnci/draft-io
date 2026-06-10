import { describe, expect, it } from 'vitest';

import {
  collapseEquivalentPositionCodes,
  expandPositionFilterCodes,
  formatPlayerPositionLabels,
  formatPositionFilterOption,
  PLAYER_POSITION_FILTER_OPTIONS,
} from './player-position-display';

describe('player-position-display', () => {
  it('exposes unique filter labels', () => {
    const labels = PLAYER_POSITION_FILTER_OPTIONS.map((option) =>
      formatPositionFilterOption(option),
    );
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels.filter((label) => label.startsWith('Sol Kanat ('))).toHaveLength(1);
    expect(labels.filter((label) => label.startsWith('Santrafor ('))).toHaveLength(1);
  });

  it('expands canonical wing and striker filters', () => {
    expect(expandPositionFilterCodes('LW')).toEqual(['LW', 'LM']);
    expect(expandPositionFilterCodes('ST')).toEqual(['ST', 'CF']);
    expect(expandPositionFilterCodes('LM')).toEqual(['LW', 'LM']);
  });

  it('formats multi-position labels with primary first', () => {
    expect(
      formatPlayerPositionLabels([
        { positionCode: 'RW', isPrimary: false },
        { positionCode: 'ST', isPrimary: true },
      ]),
    ).toEqual(['SF', 'SGK']);
  });

  it('deduplicates labels that share the same Turkish abbreviation', () => {
    expect(
      formatPlayerPositionLabels([
        { positionCode: 'LB', isPrimary: true },
        { positionCode: 'LM', isPrimary: false },
        { positionCode: 'LW', isPrimary: false },
      ]),
    ).toEqual(['SLB', 'SLK']);
  });

  it('collapses LM and LW to canonical LW', () => {
    expect(collapseEquivalentPositionCodes('LM', ['LW', 'CM'])).toEqual({
      primary: 'LW',
      secondary: ['CM'],
    });
  });
});
