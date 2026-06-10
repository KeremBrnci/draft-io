import { describe, expect, it } from 'vitest';

import { SimulateDraftFairnessUseCase } from '../../application/use-cases/simulate-draft-fairness.use-case';

describe('SimulateDraftFairnessUseCase', () => {
  it('keeps overall spread within soft balancing target', async () => {
    const useCase = new SimulateDraftFairnessUseCase();
    const result = await useCase.execute({
      participantCount: 4,
      runCount: 200,
      seed: 42,
    });

    expect(result.averageOverallSpread).toBeLessThanOrEqual(3.5);
    expect(result.maxOverallSpread).toBeLessThanOrEqual(6);
    expect(result.averageTeamOverallStdDev).toBeLessThanOrEqual(2);
    expect(result.perParticipantStats).toHaveLength(4);
  });
});
