import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { PlayerOverallReadRepository } from '../../domain/repositories/player-overall-read.repository';

interface LatestOverallRow {
  readonly player_id: string;
  readonly final_overall: number;
}

@Injectable()
export class PrismaPlayerOverallReadRepository implements PlayerOverallReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatestByPlayerIds(playerIds: readonly string[]): Promise<ReadonlyMap<string, number>> {
    if (playerIds.length === 0) {
      return new Map();
    }

    const rows = await this.prisma.$queryRaw<LatestOverallRow[]>`
      SELECT DISTINCT ON (player_id)
        player_id::text AS player_id,
        final_overall
      FROM overall_calculations
      WHERE player_id = ANY(ARRAY[${Prisma.join(playerIds.map((id) => Prisma.sql`${id}::uuid`))}])
      ORDER BY player_id, created_at DESC
    `;

    return new Map(rows.map((row) => [row.player_id, row.final_overall]));
  }
}
