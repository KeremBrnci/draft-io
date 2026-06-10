import type { Formation } from '../../domain/entities/formation.entity';
import { FormationNotFoundError } from '../../domain/errors/formation.errors';
import type { FormationRepository } from '../../domain/repositories/formation.repository';
import { FormationCode } from '../../domain/value-objects/formation-code.vo';
import type { GetFormationQuery } from '../queries/get-formation.query';

export class GetFormationUseCase {
  constructor(private readonly formationRepository: FormationRepository) {}

  async execute(query: GetFormationQuery): Promise<Formation> {
    const code = FormationCode.create(query.code);
    const formation = await this.formationRepository.findByCode(code);

    if (formation === null) {
      throw new FormationNotFoundError(query.code);
    }

    return formation;
  }
}
