import { describe, expect, it, vi } from 'vitest';

import { CardOverallSource } from '../../../cards/domain/enums/card-overall-source.enum';
import { buildTestCard } from '../../../cards/testing/card-test.factory';

import { ManualOverrideGuardService } from './manual-override-guard.service';

describe('ManualOverrideGuardService', () => {
  it('detects manual override on active cards', async () => {
    const manualCard = buildTestCard({ overallSource: CardOverallSource.MANUAL_OVERRIDE });
    const calculatedCard = buildTestCard({ overallSource: CardOverallSource.CALCULATED });

    const guard = new ManualOverrideGuardService({
      findByPlayerId: vi.fn().mockResolvedValue([manualCard, calculatedCard]),
    } as never);

    await expect(guard.hasManualOverride(manualCard.playerId)).resolves.toBe(true);
  });

  it('returns false when all active cards are calculated', async () => {
    const calculatedCard = buildTestCard({ overallSource: CardOverallSource.CALCULATED });

    const guard = new ManualOverrideGuardService({
      findByPlayerId: vi.fn().mockResolvedValue([calculatedCard]),
    } as never);

    await expect(guard.hasManualOverride(calculatedCard.playerId)).resolves.toBe(false);
  });
});
