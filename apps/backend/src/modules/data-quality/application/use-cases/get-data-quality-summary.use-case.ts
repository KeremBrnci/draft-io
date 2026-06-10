import type { DataQualityRepository, DataQualitySummary } from '../../domain/repositories/data-quality.repository';

export class GetDataQualitySummaryUseCase {
  constructor(private readonly dataQualityRepository: DataQualityRepository) {}

  async execute(): Promise<DataQualitySummary> {
    return this.dataQualityRepository.getSummary();
  }
}
