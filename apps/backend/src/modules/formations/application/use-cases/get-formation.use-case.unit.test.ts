import { describe, expect, it, vi } from 'vitest';

import { buildFormationFromTemplate } from '../../domain/constants/formation-templates';
import { FormationNotFoundError } from '../../domain/errors/formation.errors';
import type { FormationRepository } from '../../domain/repositories/formation.repository';

import { GetFormationUseCase } from './get-formation.use-case';

describe('GetFormationUseCase', () => {
  it('returns formation when found', async () => {
    const formation = buildFormationFromTemplate('4-3-3');
    const repository: FormationRepository = {
      findAll: vi.fn(),
      findByCode: vi.fn().mockResolvedValue(formation),
    };

    const useCase = new GetFormationUseCase(repository);
    const result = await useCase.execute({ code: '4-3-3' });

    expect(result.code.value).toBe('4-3-3');
  });

  it('throws when formation is not found', async () => {
    const repository: FormationRepository = {
      findAll: vi.fn(),
      findByCode: vi.fn().mockResolvedValue(null),
    };

    const useCase = new GetFormationUseCase(repository);

    await expect(useCase.execute({ code: '4-3-3' })).rejects.toThrow(FormationNotFoundError);
  });
});
