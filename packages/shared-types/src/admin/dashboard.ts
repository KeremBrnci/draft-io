export interface AdminDashboardMetricsDto {
  readonly totalPlayers: number;
  readonly totalClubs: number;
  readonly totalCompetitions: number;
  readonly importedToday: number;
  readonly failedImports: number;
}
