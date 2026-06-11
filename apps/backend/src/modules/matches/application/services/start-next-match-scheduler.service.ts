import { Injectable } from '@nestjs/common';

import { StartNextMatchUseCase } from '../use-cases/start-next-match.use-case';

@Injectable()
export class StartNextMatchScheduler {
  constructor(private readonly startNextMatchUseCase: StartNextMatchUseCase) {}

  runNext(lobbyCode: string): void {
    void this.startNextMatchUseCase.execute({ code: lobbyCode });
  }
}
