import type { StartDraftResultDto } from '@draft-io/shared-types';

import type { StartDraftResult } from '../../application/use-cases/start-draft.use-case';
import { toLobbySummary } from './lobby-response.mapper';

export function toStartDraftResultDto(result: StartDraftResult): StartDraftResultDto {
  return {
    lobby: toLobbySummary(result.lobby),
    draftSessionId: result.draftSessionId,
  };
}
