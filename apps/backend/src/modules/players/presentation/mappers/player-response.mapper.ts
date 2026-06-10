import type { PlayerPositionAssignmentDto, PlayerSummary } from '@draft-io/shared-types';

import type { Player } from '../../domain/entities/player.entity';

export function toPlayerPositionAssignments(player: Player): readonly PlayerPositionAssignmentDto[] {
  return player.positions.assignments.map((assignment) => ({
    positionCode: assignment.positionCode,
    isPrimary: assignment.isPrimary,
  }));
}

export function toPlayerSummary(player: Player): PlayerSummary {
  const positions = toPlayerPositionAssignments(player);

  return {
    id: player.id.value,
    provider: player.externalReference?.provider ?? null,
    externalId: player.externalReference?.externalId ?? null,
    firstName: player.firstName.value,
    lastName: player.lastName.value,
    displayName: player.displayName.value,
    birthDate: player.birthDate?.value.toISOString().slice(0, 10) ?? null,
    nationality: player.nationality.value,
    teamId: player.teamId,
    leagueId: player.leagueId,
    positions,
    position: player.primaryPosition.value,
    secondaryPositions: player.positions.secondaryCodes,
    marketValue: player.marketValue?.value ?? null,
    imageUrl: player.imageUrl?.value ?? null,
    status: player.status,
  };
}

export function toPlayerSummaryList(players: readonly Player[]): readonly PlayerSummary[] {
  return players.map((player) => toPlayerSummary(player));
}
