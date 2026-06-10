import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { League } from '../entities/league.entity';
import type { LeagueId } from '../value-objects/league-id.vo';

export interface LeagueRepository {
  findById(id: LeagueId): Promise<League | null>;
  findByExternalReference(provider: ExternalProvider, externalId: string): Promise<League | null>;
  findAll(): Promise<readonly League[]>;
  count(): Promise<number>;
  save(league: League): Promise<void>;
}

export const LEAGUE_REPOSITORY = Symbol('LEAGUE_REPOSITORY');
