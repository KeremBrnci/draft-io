import { Injectable } from '@nestjs/common';

import {
  buildFormationFromTemplate,
  getAllFormations,
} from '../../domain/constants/formation-templates';
import type { Formation } from '../../domain/entities/formation.entity';
import type { FormationRepository } from '../../domain/repositories/formation.repository';
import type { FormationCode } from '../../domain/value-objects/formation-code.vo';

/**
 * In-memory formation repository for unit tests.
 */
@Injectable()
export class InMemoryFormationRepository implements FormationRepository {
  private readonly formations: readonly Formation[];

  constructor() {
    this.formations = getAllFormations();
  }

  findAll(): Promise<readonly Formation[]> {
    return Promise.resolve(this.formations);
  }

  findById(id: string): Promise<Formation | null> {
    const formation = this.formations.find((entry) => entry.id === id);
    return Promise.resolve(formation ?? null);
  }

  findByCode(code: FormationCode): Promise<Formation | null> {
    const formation = this.formations.find((entry) => entry.code.value === code.value);
    return Promise.resolve(formation ?? buildFormationFromTemplate(code.value));
  }
}
