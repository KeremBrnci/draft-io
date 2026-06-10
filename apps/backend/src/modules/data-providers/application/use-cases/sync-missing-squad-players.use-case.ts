import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { TransfermarktSquadPageClient } from '../../infrastructure/transfermarkt/scraping/transfermarkt-squad-page.client';
import {
  mapScrapedSquadPlayerToExternalRecord,
  parseTransfermarktSquadPage,
} from '../../infrastructure/transfermarkt/scraping/transfermarkt-squad-page.parser';
import { resolveTransfermarktSeasonId } from '../../infrastructure/transfermarkt/utils/transfermarkt-season';

import type { ImportPlayerUseCase } from './import-player.use-case';

export interface SyncMissingSquadPlayersCommand {
  readonly provider: string;
  readonly clubExternalId?: string;
}

export interface SyncMissingSquadPlayersResult {
  readonly scannedTeams: number;
  readonly squadPlayers: number;
  readonly imported: number;
  readonly skippedExisting: number;
  readonly failed: number;
  readonly importedPlayers: readonly {
    readonly externalId: string;
    readonly displayName: string;
  }[];
  readonly failures: readonly {
    readonly externalId: string;
    readonly displayName: string;
    readonly reason: string;
  }[];
}

const REQUEST_DELAY_MS = 250;

export class SyncMissingSquadPlayersUseCase {
  private readonly squadPageClient = new TransfermarktSquadPageClient();

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
  ) {}

  async execute(command: SyncMissingSquadPlayersCommand): Promise<SyncMissingSquadPlayersResult> {
    const provider = parseExternalProvider(command.provider);
    const seasonId = resolveTransfermarktSeasonId();
    const teams =
      command.clubExternalId !== undefined
        ? await this.resolveSingleTeam(provider, command.clubExternalId)
        : await this.teamRepository.findAll();

    const importedPlayers: { externalId: string; displayName: string }[] = [];
    const failures: { externalId: string; displayName: string; reason: string }[] = [];
    let squadPlayers = 0;
    let imported = 0;
    let skippedExisting = 0;
    let failed = 0;
    let scannedTeams = 0;

    for (const team of teams) {
      const clubExternalId = team.externalReference?.externalId ?? null;
      if (clubExternalId === null) {
        continue;
      }

      scannedTeams += 1;
      const leagueExternalId = await this.resolveLeagueExternalId(team.leagueId);

      let html: string;
      try {
        html = await this.squadPageClient.fetchSquadHtml(clubExternalId, seasonId);
      } catch (error) {
        failures.push({
          externalId: clubExternalId,
          displayName: team.name.value,
          reason: error instanceof Error ? error.message : 'Squad page fetch failed',
        });
        failed += 1;
        continue;
      }

      const squad = parseTransfermarktSquadPage(html);
      squadPlayers += squad.length;

      for (const squadPlayer of squad) {
        const existing = await this.playerRepository.findByExternalReference(
          provider,
          squadPlayer.externalId,
        );

        if (existing !== null) {
          skippedExisting += 1;
          continue;
        }

        try {
          await this.importFromProviderOrSquad(
            command.provider,
            squadPlayer.slug,
            squadPlayer.externalId,
            mapScrapedSquadPlayerToExternalRecord(squadPlayer, clubExternalId, leagueExternalId),
            team.id.value,
            team.leagueId,
          );

          imported += 1;
          importedPlayers.push({
            externalId: squadPlayer.externalId,
            displayName: squadPlayer.displayName,
          });
        } catch (error) {
          failed += 1;
          failures.push({
            externalId: squadPlayer.externalId,
            displayName: squadPlayer.displayName,
            reason: error instanceof Error ? error.message : 'Import failed',
          });
        }
      }

      await sleep(REQUEST_DELAY_MS);
    }

    return {
      scannedTeams,
      squadPlayers,
      imported,
      skippedExisting,
      failed,
      importedPlayers,
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

  private async resolveLeagueExternalId(leagueId: string | null): Promise<string | null> {
    if (leagueId === null) {
      return null;
    }

    const league = await this.leagueRepository.findById(LeagueId.create(leagueId));
    return league?.externalReference?.externalId ?? null;
  }

  private async importFromProviderOrSquad(
    provider: string,
    slug: string,
    externalId: string,
    squadRecord: ReturnType<typeof mapScrapedSquadPlayerToExternalRecord>,
    teamId: string,
    leagueId: string | null,
  ): Promise<void> {
    try {
      const player = await this.importPlayerUseCase.execute({ provider, slug, externalId });

      if (player.birthDate === null || player.imageUrl === null) {
        await this.importPlayerUseCase.upsertFromRecord(squadRecord, { teamId, leagueId });
      }

      return;
    } catch {
      // Transfermarkt API is often blocked — squad snapshot is the reliable fallback.
    }

    await this.importPlayerUseCase.upsertFromRecord(squadRecord, { teamId, leagueId });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}
