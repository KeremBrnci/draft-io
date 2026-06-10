import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import type { Player } from '../../../players/domain/entities/player.entity';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { TransfermarktSquadPageClient } from '../../infrastructure/transfermarkt/scraping/transfermarkt-squad-page.client';
import {
  mapScrapedSquadPlayerToExternalRecord,
  parseTransfermarktSquadPage,
  type ScrapedSquadPlayer,
} from '../../infrastructure/transfermarkt/scraping/transfermarkt-squad-page.parser';
import { resolveTransfermarktSeasonId } from '../../infrastructure/transfermarkt/utils/transfermarkt-season';

import type { ImportPlayerUseCase } from './import-player.use-case';

export interface EnrichPlayersFromSquadCommand {
  readonly provider: string;
  readonly clubExternalId?: string;
}

export interface EnrichPlayersFromSquadResult {
  readonly incompletePlayers: number;
  readonly scannedTeams: number;
  readonly enriched: number;
  readonly unchanged: number;
  readonly notOnSquad: number;
  readonly failed: number;
  readonly enrichedPlayers: readonly {
    readonly externalId: string;
    readonly displayName: string;
    readonly fields: readonly string[];
  }[];
  readonly failures: readonly {
    readonly externalId: string;
    readonly displayName: string;
    readonly reason: string;
  }[];
}

const REQUEST_DELAY_MS = 250;

export class EnrichPlayersFromSquadUseCase {
  private readonly squadPageClient = new TransfermarktSquadPageClient();

  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
  ) {}

  async execute(command: EnrichPlayersFromSquadCommand): Promise<EnrichPlayersFromSquadResult> {
    const provider = parseExternalProvider(command.provider);
    const seasonId = resolveTransfermarktSeasonId();
    const incompletePlayers = await this.findIncompletePlayers();
    const playersByTeamId = groupPlayersByTeam(incompletePlayers);

    const teams =
      command.clubExternalId !== undefined
        ? await this.resolveSingleTeam(provider, command.clubExternalId)
        : await this.teamRepository.findAll();

    const enrichedPlayers: { externalId: string; displayName: string; fields: string[] }[] = [];
    const failures: { externalId: string; displayName: string; reason: string }[] = [];
    let scannedTeams = 0;
    let enriched = 0;
    let unchanged = 0;
    let notOnSquad = 0;
    let failed = 0;

    for (const team of teams) {
      const clubExternalId = team.externalReference?.externalId ?? null;
      if (clubExternalId === null) {
        continue;
      }

      const teamPlayers = playersByTeamId.get(team.id.value) ?? [];
      if (teamPlayers.length === 0) {
        continue;
      }

      scannedTeams += 1;
      const leagueExternalId = await this.resolveLeagueExternalId(team.leagueId);

      let html: string;
      try {
        html = await this.squadPageClient.fetchSquadHtml(clubExternalId, seasonId);
      } catch (error) {
        for (const player of teamPlayers) {
          failed += 1;
          failures.push({
            externalId: player.externalReference?.externalId ?? 'unknown',
            displayName: player.displayName.value,
            reason: error instanceof Error ? error.message : 'Squad page fetch failed',
          });
        }
        continue;
      }

      const squadByExternalId = new Map(
        parseTransfermarktSquadPage(html).map((entry) => [entry.externalId, entry]),
      );

      for (const player of teamPlayers) {
        const externalId = player.externalReference?.externalId;
        if (externalId === undefined) {
          failed += 1;
          failures.push({
            externalId: 'unknown',
            displayName: player.displayName.value,
            reason: 'Player has no external id',
          });
          continue;
        }

        const squadPlayer = squadByExternalId.get(externalId);
        if (squadPlayer === undefined) {
          notOnSquad += 1;
          continue;
        }

        const fields = listEnrichableFields(player, squadPlayer);
        if (fields.length === 0) {
          unchanged += 1;
          continue;
        }

        try {
          await this.importPlayerUseCase.upsertFromRecord(
            mapScrapedSquadPlayerToExternalRecord(squadPlayer, clubExternalId, leagueExternalId),
            { teamId: team.id.value, leagueId: team.leagueId },
          );

          enriched += 1;
          enrichedPlayers.push({
            externalId,
            displayName: player.displayName.value,
            fields,
          });
        } catch (error) {
          failed += 1;
          failures.push({
            externalId,
            displayName: player.displayName.value,
            reason: error instanceof Error ? error.message : 'Enrichment failed',
          });
        }
      }

      await sleep(REQUEST_DELAY_MS);
    }

    return {
      incompletePlayers: incompletePlayers.length,
      scannedTeams,
      enriched,
      unchanged,
      notOnSquad,
      failed,
      enrichedPlayers,
      failures,
    };
  }

  private async findIncompletePlayers(): Promise<readonly Player[]> {
    const [withoutAge, withoutImage] = await Promise.all([
      this.playerRepository.findPaginated(
        { hasAge: false },
        { field: 'name', direction: 'asc' },
        { page: 1, pageSize: 10_000 },
      ),
      this.playerRepository.findPaginated(
        { hasImage: false },
        { field: 'name', direction: 'asc' },
        { page: 1, pageSize: 10_000 },
      ),
    ]);

    const byId = new Map<string, Player>();
    for (const player of [...withoutAge.items, ...withoutImage.items]) {
      byId.set(player.id.value, player);
    }

    return [...byId.values()];
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
}

function groupPlayersByTeam(players: readonly Player[]): Map<string, Player[]> {
  const grouped = new Map<string, Player[]>();

  for (const player of players) {
    if (player.teamId === null) {
      continue;
    }

    const bucket = grouped.get(player.teamId) ?? [];
    bucket.push(player);
    grouped.set(player.teamId, bucket);
  }

  return grouped;
}

function listEnrichableFields(player: Player, squadPlayer: ScrapedSquadPlayer): string[] {
  const fields: string[] = [];

  if (player.birthDate === null && (squadPlayer.dateOfBirth !== null || squadPlayer.age !== null)) {
    fields.push('birthDate');
  }

  if (player.imageUrl === null && squadPlayer.imageUrl !== null) {
    fields.push('imageUrl');
  }

  if (player.nationality.value === 'UNKNOWN' && squadPlayer.nationality !== 'Unknown') {
    fields.push('nationality');
  }

  return fields;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}
