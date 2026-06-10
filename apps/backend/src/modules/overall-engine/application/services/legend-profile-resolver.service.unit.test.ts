import { describe, expect, it } from 'vitest';

import { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import { PlayerMetricsId } from '../../domain/value-objects/player-metrics-id.vo';

import { resolveProfileInputs } from './legend-profile-resolver.service';

function buildMetrics(overrides: {
  readonly careerScore?: number;
  readonly legacyScore?: number;
  readonly profileTag?: OverallProfileTag | null;
}): PlayerMetrics {
  return PlayerMetrics.create({
    id: PlayerMetricsId.create('550e8400-e29b-41d4-a716-446655440001'),
    playerId: '550e8400-e29b-41d4-a716-446655440000',
    algorithmVersionId: '550e8400-e29b-41d4-a716-446655440002',
    components: {
      marketValueScore: 55,
      careerScore: overrides.careerScore ?? 50,
      ageScore: 60,
      leagueScore: 80,
      legacyScore: overrides.legacyScore ?? 0,
    },
    profileTag: overrides.profileTag ?? null,
  });
}

describe('resolveProfileInputs', () => {
  it('applies legend overrides for N\'Golo Kanté', () => {
    const resolved = resolveProfileInputs('225083', buildMetrics({}));

    expect(resolved.profileTag).toBe(OverallProfileTag.LEGEND_ACTIVE_OLD);
    expect(resolved.careerScore).toBe(94);
    expect(resolved.legacyScore).toBe(92);
  });

  it('keeps manually higher admin scores', () => {
    const resolved = resolveProfileInputs(
      '225083',
      buildMetrics({ careerScore: 99, legacyScore: 97, profileTag: OverallProfileTag.ELITE_CURRENT }),
    );

    expect(resolved.careerScore).toBe(99);
    expect(resolved.legacyScore).toBe(97);
    expect(resolved.profileTag).toBe(OverallProfileTag.ELITE_CURRENT);
  });

  it('returns stored metrics for unknown players', () => {
    const resolved = resolveProfileInputs('999999', buildMetrics({ careerScore: 72, legacyScore: 10 }));

    expect(resolved.careerScore).toBe(72);
    expect(resolved.legacyScore).toBe(10);
    expect(resolved.profileTag).toBeNull();
  });
});
