import type { Nation } from '../../domain/entities/nation.entity';
import type { NationRepository } from '../../domain/repositories/nation.repository';

export class ListNationsUseCase {
  constructor(private readonly nationRepository: NationRepository) {}

  async execute(): Promise<readonly Nation[]> {
    return this.nationRepository.findAll();
  }
}
