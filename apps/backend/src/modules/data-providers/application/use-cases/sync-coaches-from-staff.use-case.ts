import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { Coach } from '../../../coaches/domain/entities/coach.entity';
import type { CoachRepository } from '../../../coaches/domain/repositories/coach.repository';
import { CoachId } from '../../../coaches/domain/value-objects/coach-id.vo';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  findHeadCoachFromStaffPage,
  splitCoachName,
} from '../../infrastructure/transfermarkt/scraping/transfermarkt-staff-page.parser';
import { TransfermarktStaffPageClient } from '../../infrastructure/transfermarkt/scraping/transfermarkt-staff-page.client';

export interface SyncCoachesFromStaffCommand {
  readonly provider: string;
  readonly clubExternalId?: string;
}

export interface SyncCoachesFromStaffResult {
  readonly scannedTeams: number;
  readonly imported: number;
  readonly updated: number;
  readonly missing: number;
  readonly failed: number;
  readonly coaches: readonly { readonly externalId: string; readonly displayName: string; readonly teamName: string }[];
  readonly failures: readonly { readonly externalId: string; readonly displayName: string; readonly reason: string }[];
}

const REQUEST_DELAY_MS = 250;

export class SyncCoachesFromStaffUseCase {
  private readonly staffPageClient = new TransfermarktStaffPageClient();

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly coachRepository: CoachRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SyncCoachesFromStaffCommand): Promise<SyncCoachesFromStaffResult> {
    const provider = parseExternalProvider(command.provider);
    const teams =
      command.clubExternalId !== undefined
        ? await this.resolveSingleTeam(provider, command.clubExternalId)
        : await this.teamRepository.findAll();

    const coaches: Array<{ externalId: string; displayName: string; teamName: string }> = [];
    const failures: Array<{ externalId: string; displayName: string; reason: string }> = [];
    let scannedTeams = 0;
    let imported = 0;
    let updated = 0;
    let missing = 0;
    let failed = 0;

    for (const team of teams) {
      const clubExternalId = team.externalReference?.externalId ?? null;
      if (clubExternalId === null) {
        continue;
      }

      scannedTeams += 1;

      try {
        const html = await this.staffPageClient.fetchStaffHtml(clubExternalId);
        const headCoach = findHeadCoachFromStaffPage(html);

        if (headCoach === null) {
          missing += 1;
          continue;
        }

        const existing = await this.coachRepository.findByExternalReference(
          provider,
          headCoach.externalId,
        );
        const { firstName, lastName } = splitCoachName(headCoach.displayName);
        const now = new Date();

        const coach = Coach.reconstitute({
          id: existing?.id ?? CoachId.generate(),
          provider,
          externalId: headCoach.externalId,
          firstName,
          lastName,
          displayName: headCoach.displayName,
          role: headCoach.role,
          nationality: headCoach.nationality.toUpperCase(),
          age: headCoach.age,
          birthDate: null,
          imageUrl: headCoach.imageUrl,
          appointedDate:
            headCoach.appointedDate === null ? null : new Date(headCoach.appointedDate),
          contractExpires:
            headCoach.contractExpires === null ? null : new Date(headCoach.contractExpires),
          teamId: team.id.value,
          leagueId: team.leagueId,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        });

        await this.coachRepository.save(coach);

        await this.prisma.team.update({
          where: { id: team.id.value },
          data: { manager: headCoach.displayName },
        });

        if (existing === null) {
          imported += 1;
        } else {
          updated += 1;
        }

        coaches.push({
          externalId: headCoach.externalId,
          displayName: headCoach.displayName,
          teamName: team.name.value,
        });
      } catch (error) {
        failed += 1;
        failures.push({
          externalId: clubExternalId,
          displayName: team.name.value,
          reason: error instanceof Error ? error.message : 'Staff sync failed',
        });
      }

      await sleep(REQUEST_DELAY_MS);
    }

    return {
      scannedTeams,
      imported,
      updated,
      missing,
      failed,
      coaches,
      failures,
    };
  }

  private async resolveSingleTeam(
    provider: ReturnType<typeof parseExternalProvider>,
    clubExternalId: string,
  ) {
    const team = await this.teamRepository.findByExternalReference(provider, clubExternalId);

    if (team === null) {
      throw new Error(`Club ${clubExternalId} is not imported yet.`);
    }

    return [team];
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}
