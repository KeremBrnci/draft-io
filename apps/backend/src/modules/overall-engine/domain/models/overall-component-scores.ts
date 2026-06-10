/** Normalized 0–100 component scores used by the V1 weighted formula. */
export interface OverallComponentScores {
  readonly marketValueScore: number;
  readonly careerScore: number;
  readonly ageScore: number;
  readonly leagueScore: number;
  readonly legacyScore: number;
}
