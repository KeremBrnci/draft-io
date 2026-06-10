import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../infrastructure/database/database.module';
import { CoachesModule } from '../modules/coaches/coaches.module';
import { DataProvidersModule } from '../modules/data-providers/data-providers.module';
import { OverallEngineModule } from '../modules/overall-engine/overall-engine.module';

/** Minimal Nest context for CLI seeding — skips full AppModule env validation. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CoachesModule,
    DataProvidersModule,
    OverallEngineModule,
  ],
})
export class SeedAppModule {}
