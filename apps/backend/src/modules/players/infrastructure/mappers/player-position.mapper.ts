import type { PlayerPosition as PrismaPlayerPosition } from '@prisma/client';

import { Position } from '../../../positions/domain/value-objects/position.vo';
import { PlayerPosition } from '../../domain/entities/player-position.entity';
import { type PlayerId } from '../../domain/value-objects/player-id.vo';
import { PlayerPositionId } from '../../domain/value-objects/player-position-id.vo';
import { PlayerPositions } from '../../domain/value-objects/player-positions.vo';

export function toPlayerPositionsDomain(
  playerId: PlayerId,
  records: readonly PrismaPlayerPosition[],
): PlayerPositions {
  const assignments = records.map((record) =>
    PlayerPosition.reconstitute({
      id: PlayerPositionId.create(record.id),
      playerId,
      position: Position.create(record.positionCode),
      isPrimary: record.isPrimary,
      createdAt: record.createdAt,
    }),
  );

  return PlayerPositions.fromAssignments(assignments);
}

export function toPlayerPositionPersistence(assignment: PlayerPosition): {
  id: string;
  playerId: string;
  positionCode: string;
  isPrimary: boolean;
  createdAt: Date;
} {
  return {
    id: assignment.id.value,
    playerId: assignment.playerId.value,
    positionCode: assignment.positionCode,
    isPrimary: assignment.isPrimary,
    createdAt: assignment.createdAt,
  };
}
