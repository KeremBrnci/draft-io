import { describe, expect, it, vi } from 'vitest';

import { buildFormationFromTemplate } from '../../domain/constants/formation-templates';
import type { FormationRepository } from '../../domain/repositories/formation.repository';

import { ListFormationsUseCase } from './list-formations.use-case';

describe('ListFormationsUseCase', () => {
  it('returns all formations from repository', async () => {
    const formations = [buildFormationFromTemplate('4-4-2')];
    const repository: FormationRepository = {
      findAll: vi.fn().mockResolvedValue(formations),
      findByCode: vi.fn(),
    };

    const useCase = new ListFormationsUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual(formations);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
});
