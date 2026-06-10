import { Module } from '@nestjs/common';

import { MatchSimulationEngine } from './domain/services/match-simulation-engine.service';

@Module({
  providers: [MatchSimulationEngine],
  exports: [MatchSimulationEngine],
})
export class SimulationModule {}
