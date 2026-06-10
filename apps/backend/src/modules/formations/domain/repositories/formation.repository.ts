import type { Formation } from '../entities/formation.entity';
import type { FormationCode } from '../value-objects/formation-code.vo';

export interface FormationRepository {
  findAll(): Promise<readonly Formation[]>;
  findById(id: string): Promise<Formation | null>;
  findByCode(code: FormationCode): Promise<Formation | null>;
}

export const FORMATION_REPOSITORY = Symbol('FORMATION_REPOSITORY');
