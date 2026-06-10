import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { seedFormationsIfEmpty } from '../persistence/prisma-formation.repository';

@Injectable()
export class FormationSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await seedFormationsIfEmpty(this.prisma);
  }
}
