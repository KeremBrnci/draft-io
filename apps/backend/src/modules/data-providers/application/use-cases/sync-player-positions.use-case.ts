import { slugify } from '@draft-io/shared-utils';

import {
  type ExternalProvider,
  parseExternalProvider,
} from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import type { Player } from '../../../players/domain/entities/player.entity';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import { normalizeExternalPositionCode } from '../../../positions/application/normalize-external-position-code';
import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';
import { TransfermarktPlayerProfileClient } from '../../infrastructure/transfermarkt/scraping/transfermarkt-player-profile.client';
import {
  parseTransfermarktPlayerProfilePositions,
  type ScrapedPlayerPositions,
} from '../../infrastructure/transfermarkt/scraping/transfermarkt-player-profile.parser';

import type { ImportPlayerUseCase } from './import-player.use-case';

export interface SyncPlayerPositionsCommand {
  readonly provider: string;
  readonly clubExternalId?: string;
}

export interface SyncPlayerPositionsResult {
  readonly scannedPlayers: number;
  readonly enriched: number;
  readonly unchanged: number;
  readonly withoutProfile: number;
  readonly failed: number;
  readonly enrichedPlayers: readonly {
    readonly externalId: string;
    readonly displayName: string;
    readonly positions: readonly string[];
  }[];
}

const REQUEST_DELAY_MS = 200;

export class SyncPlayerPositionsUseCase {
  private readonly profileClient = new TransfermarktPlayerProfileClient();

  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
  ) {}

  async execute(command: SyncPlayerPositionsCommand): Promise<SyncPlayerPositionsResult> {
    const provider = parseExternalProvider(command.provider);
    const players = await this.loadPlayers(command.clubExternalId, provider);

    const enrichedPlayers: {
      externalId: string;
      displayName: string;
      positions: string[];
    }[] = [];
    let enriched = 0;
    let unchanged = 0;
    let withoutProfile = 0;
    let failed = 0;

    for (const player of players) {
      const externalId = player.externalReference?.externalId;
      if (externalId === undefined) {
        continue;
      }

      try {
        const html = await this.profileClient.fetchProfileHtml(externalId);
        const scraped = parseTransfermarktPlayerProfilePositions(html);

        if (scraped === null) {
          withoutProfile += 1;
          continue;
        }

        const normalizedNext = normalizeScrapedPositionCodes(scraped);
        const currentCodes = [...player.positions.allCodes];

        if (positionsAreEqual(currentCodes, normalizedNext)) {
          unchanged += 1;
          continue;
        }

        const record = await this.buildEnrichmentRecord(player, scraped, provider);
        await this.importPlayerUseCase.upsertFromRecord(record, {
          ...(player.teamId !== null ? { teamId: player.teamId } : {}),
          ...(player.leagueId !== null ? { leagueId: player.leagueId } : {}),
        });

        enriched += 1;
        enrichedPlayers.push({
          externalId,
          displayName: player.displayName.value,
          positions: normalizedNext,
        });
      } catch {
        failed += 1;
      }

      await sleep(REQUEST_DELAY_MS);
    }

    return {
      scannedPlayers: players.length,
      enriched,
      unchanged,
      withoutProfile,
      failed,
      enrichedPlayers,
    };
  }

  private async loadPlayers(
    clubExternalId: string | undefined,
    provider: ReturnType<typeof parseExternalProvider>,
  ): Promise<readonly Player[]> {
    if (clubExternalId === undefined) {
      const page = await this.playerRepository.findPaginated(
        {},
        { field: 'name', direction: 'asc' },
        { page: 1, pageSize: 10_000 },
      );
      return page.items;
    }

    const team = await this.teamRepository.findByExternalReference(provider, clubExternalId);
    if (team === null) {
      throw new Error(`Club ${clubExternalId} is not imported yet.`);
    }

    const page = await this.playerRepository.findPaginated(
      { teamId: team.id.value },
      { field: 'name', direction: 'asc' },
      { page: 1, pageSize: 10_000 },
    );
    return page.items;
  }

  private async buildEnrichmentRecord(
    player: Player,
    scraped: ScrapedPlayerPositions,
    provider: ExternalProvider,
  ): Promise<ExternalPlayerRecord> {
    const externalId = player.externalReference?.externalId ?? '';

    return {
      provider,
      slug: slugify(player.displayName.value),
      externalId,
      firstName: player.firstName.value,
      lastName: player.lastName.value,
      displayName: player.displayName.value,
      nationality: player.nationality.value,
      teamExternalId: await this.resolveTeamExternalId(player.teamId),
      leagueExternalId: await this.resolveLeagueExternalId(player.leagueId),
      primaryPosition: scraped.primaryPosition,
      secondaryPositions: scraped.secondaryPositions,
      age: null,
      dateOfBirth: player.birthDate?.value.toISOString().slice(0, 10) ?? null,
      apiOverallHint: null,
      marketValue: player.marketValue?.value ?? null,
      marketValueCurrency: player.marketValueCurrency,
      imageUrl: player.imageUrl?.value ?? null,
      status: player.status,
    };
  }

  private async resolveTeamExternalId(teamId: string | null): Promise<string | null> {
    if (teamId === null) {
      return null;
    }

    const team = await this.teamRepository.findById(TeamId.create(teamId));
    return team?.externalReference?.externalId ?? null;
  }

  private async resolveLeagueExternalId(leagueId: string | null): Promise<string | null> {
    if (leagueId === null) {
      return null;
    }

    const league = await this.leagueRepository.findById(LeagueId.create(leagueId));
    return league?.externalReference?.externalId ?? null;
  }
}

function normalizeScrapedPositionCodes(scraped: ScrapedPlayerPositions): PositionCode[] {
  const primary = normalizeExternalPositionCode(scraped.primaryPosition) ?? 'CM';
  const secondary = scraped.secondaryPositions
    .map((position) => normalizeExternalPositionCode(position))
    .filter((code): code is PositionCode => code !== null && code !== primary);

  return [primary, ...secondary];
}

function positionsAreEqual(currentCodes: readonly string[], nextCodes: readonly string[]): boolean {
  if (currentCodes.length !== nextCodes.length) {
    return false;
  }

  return currentCodes.every((code, index) => code === nextCodes[index]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}
