import type { Formation } from '../../domain/entities/formation.entity';
import type { FormationRepository } from '../../domain/repositories/formation.repository';

export class ListFormationsUseCase {
  constructor(private readonly formationRepository: FormationRepository) {}

  async execute(): Promise<readonly Formation[]> {
    return this.formationRepository.findAll();
  }
}
