export type ImportJobStatusDto =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';
export type ImportJobTypeDto =
  | 'COMPETITION'
  | 'CLUBS'
  | 'PLAYERS'
  | 'ENRICHMENT'
  | 'PIPELINE';

export interface ImportJobLogDto {
  readonly id: string;
  readonly jobId: string;
  readonly level: 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly createdAt: string;
}

export interface ImportFailedRecordDto {
  readonly id: string;
  readonly jobId: string;
  readonly recordType: 'CLUB' | 'PLAYER' | 'COMPETITION';
  readonly externalId: string | null;
  readonly slug: string | null;
  readonly displayName: string | null;
  readonly errorMessage: string;
  readonly resolved: boolean;
  readonly createdAt: string;
}

export interface ImportJobDto {
  readonly id: string;
  readonly jobType: ImportJobTypeDto;
  readonly provider: string;
  readonly targetCompetition: string | null;
  readonly targetExternalId: string | null;
  readonly targetName: string | null;
  readonly status: ImportJobStatusDto;
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly totalRecords: number;
  readonly processedRecords: number;
  readonly failedRecords: number;
  readonly errorMessage: string | null;
  readonly createdAt: string;
}

export type TargetCompetitionImportStatusDto =
  | 'NOT_IMPORTED'
  | 'RUNNING'
  | 'IMPORTED';

export interface TargetCompetitionDto {
  readonly externalId: string;
  readonly slug: string;
  readonly name: string;
  readonly countryName: string;
  readonly countryExternalId: string;
  readonly tier: 1 | 2;
  readonly imported: boolean;
  readonly importStatus: TargetCompetitionImportStatusDto;
}

export interface ImportCompetitionCommandDto {
  readonly provider: string;
  readonly competitionExternalId: string;
}

export interface ImportJobResultDto {
  readonly jobId: string;
  readonly status: ImportJobStatusDto;
  readonly processedRecords: number;
  readonly failedRecords: number;
}
