export interface OverallAlgorithmVersionRecord {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
}

export interface OverallAlgorithmVersionRepository {
  ensureVersion(
    code: string,
    name: string,
    description?: string,
  ): Promise<OverallAlgorithmVersionRecord>;
  findById(id: string): Promise<OverallAlgorithmVersionRecord | null>;
  findByCode(code: string): Promise<OverallAlgorithmVersionRecord | null>;
}

export const OVERALL_ALGORITHM_VERSION_REPOSITORY = Symbol('OVERALL_ALGORITHM_VERSION_REPOSITORY');
