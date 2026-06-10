import type { StartLobbyResultDto } from '@draft-io/shared-types';

import type { StartLobbyResult } from '../../application/use-cases/start-lobby.use-case';

import { toLobbySummary } from './lobby-response.mapper';

export function toStartLobbyResultDto(result: StartLobbyResult): StartLobbyResultDto {
  return {
    lobby: toLobbySummary(result.lobby),
  };
}
