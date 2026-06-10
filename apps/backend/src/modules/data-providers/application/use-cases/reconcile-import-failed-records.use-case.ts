import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import type { ImportFailedRecordRepository } from '../../domain/repositories/import-failed-record.repository';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';

export interface ReconcileImportFailedRecordsCommand {
  readonly jobId: string;
  readonly provider: string;
}

export class ReconcileImportFailedRecordsUseCase {
  constructor(
    private readonly importFailedRecordRepository: ImportFailedRecordRepository,
    private readonly teamRepository: TeamRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  async execute(command: ReconcileImportFailedRecordsCommand): Promise<number> {
    const provider = parseExternalProvider(command.provider);
    const jobId = ImportJobId.create(command.jobId);
    const records = await this.importFailedRecordRepository.findUnresolvedByJobId(jobId);

    let resolved = 0;

    for (const record of records) {
      if (record.externalId === null) {
        continue;
      }

      const exists = await this.recordExistsInDatabase(record.recordType, provider, record.externalId);

      if (exists) {
        await this.importFailedRecordRepository.markResolved(record.id);
        resolved += 1;
      }
    }

    return resolved;
  }

  private async recordExistsInDatabase(
    recordType: string,
    provider: ReturnType<typeof parseExternalProvider>,
    externalId: string,
  ): Promise<boolean> {
    if (recordType === 'CLUB') {
      const team = await this.teamRepository.findByExternalReference(provider, externalId);
      return team !== null;
    }

    if (recordType === 'PLAYER') {
      const player = await this.playerRepository.findByExternalReference(provider, externalId);
      return player !== null;
    }

    return false;
  }
}
