import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';

import { seedPlayerCardsIfMissing } from './seed-player-cards';

@Injectable()
export class PlayerCardSeedService implements OnModuleInit {
  private readonly logger = new Logger(PlayerCardSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const createdOrExisting = await seedPlayerCardsIfMissing(this.prisma);
    if (createdOrExisting > 0) {
      this.logger.log(`Draft card pool ready (${createdOrExisting} cards)`);
    }
  }
}
