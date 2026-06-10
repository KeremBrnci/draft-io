import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../src/core/external-reference/external-provider';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';
import { Player } from '../../src/modules/players/domain/entities/player.entity';
import { PlayerStatus } from '../../src/modules/players/domain/enums/player-status.enum';
import { DisplayName } from '../../src/modules/players/domain/value-objects/display-name.vo';
import { ExternalReference } from '../../src/modules/players/domain/value-objects/external-reference.vo';
import { Nationality } from '../../src/modules/players/domain/value-objects/nationality.vo';
import { PersonName } from '../../src/modules/players/domain/value-objects/person-name.vo';
import { PlayerId } from '../../src/modules/players/domain/value-objects/player-id.vo';
import { PrismaPlayerRepository } from '../../src/modules/players/infrastructure/persistence/prisma-player.repository';
import { buildTestPlayerPositions } from '../../src/modules/players/testing/player-test.factory';

const VALID_PLAYER_ID = '660e8400-e29b-41d4-a716-446655440001';

describe.skipIf(!process.env.DATABASE_URL)('PrismaPlayerRepository', () => {
  let prisma: PrismaService;
  let repository: PrismaPlayerRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaPlayerRepository(prisma);
  });

  afterAll(async () => {
    await prisma.playerPosition.deleteMany({ where: { playerId: VALID_PLAYER_ID } });
    await prisma.player.deleteMany({ where: { id: VALID_PLAYER_ID } });
    await prisma.$disconnect();
  });

  it('persists and retrieves player positions via player_positions', async () => {
    const playerId = PlayerId.create(VALID_PLAYER_ID);
    const player = Player.create({
      id: playerId,
      externalReference: ExternalReference.create(ExternalProvider.SPORTDB, 'ext-1'),
      firstName: PersonName.create('Integration'),
      lastName: PersonName.create('Player'),
      displayName: DisplayName.create('Integration Test Player'),
      birthDate: null,
      nationality: Nationality.create('US'),
      countryId: null,
      teamId: null,
      leagueId: null,
      positions: buildTestPlayerPositions(playerId, 'GK', ['CB']),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });

    await repository.save(player);

    const found = await repository.findById(playerId);
    const byExternal = await repository.findByExternalReference(ExternalProvider.SPORTDB, 'ext-1');

    expect(found?.displayName.value).toBe('Integration Test Player');
    expect(found?.primaryPosition.value).toBe('GK');
    expect(found?.positions.secondaryCodes).toEqual(['CB']);
    expect(byExternal?.id.value).toBe(VALID_PLAYER_ID);
  });
});
