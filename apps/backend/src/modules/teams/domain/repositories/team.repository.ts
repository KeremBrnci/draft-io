import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Team } from '../entities/team.entity';
import type { TeamId } from '../value-objects/team-id.vo';

export interface TeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findByExternalReference(provider: ExternalProvider, externalId: string): Promise<Team | null>;
  findByLeagueId(leagueId: string): Promise<readonly Team[]>;
  findAll(): Promise<readonly Team[]>;
  count(): Promise<number>;
  save(team: Team): Promise<void>;
}

export const TEAM_REPOSITORY = Symbol('TEAM_REPOSITORY');
