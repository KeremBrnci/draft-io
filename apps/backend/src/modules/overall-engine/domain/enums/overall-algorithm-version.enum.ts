export const OVERALL_ALGORITHM_V1 = 'V1' as const;

export type OverallAlgorithmVersionCode = typeof OVERALL_ALGORITHM_V1;

export const ALL_OVERALL_ALGORITHM_VERSIONS: readonly OverallAlgorithmVersionCode[] = [
  OVERALL_ALGORITHM_V1,
];
