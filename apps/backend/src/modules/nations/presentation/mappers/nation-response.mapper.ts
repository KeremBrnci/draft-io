import type { Nation } from '../../domain/entities/nation.entity';

export interface NationSummaryResponse {
  readonly id: string;
  readonly name: string;
}

export function toNationSummary(nation: Nation): NationSummaryResponse {
  return {
    id: nation.id.value,
    name: nation.name.value,
  };
}

export function toNationSummaryList(nations: readonly Nation[]): readonly NationSummaryResponse[] {
  return nations.map((nation) => toNationSummary(nation));
}
