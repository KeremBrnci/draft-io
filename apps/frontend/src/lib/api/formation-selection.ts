import type {
  FormationSelectionStateDto,
  SelectFormationCommandDto,
  StartDraftResultDto,
  StartLobbyCommandDto,
} from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function getFormationSelection(
  code: string,
  sessionToken: string,
): Promise<FormationSelectionStateDto> {
  const params = new URLSearchParams({ sessionToken });
  return apiGet<FormationSelectionStateDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/formation-selection?${params.toString()}`,
  );
}

export function selectFormation(
  code: string,
  body: SelectFormationCommandDto,
): Promise<FormationSelectionStateDto> {
  return apiPost<FormationSelectionStateDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/formation-selection/select`,
    body,
  );
}

export function startDraft(code: string, body: StartLobbyCommandDto): Promise<StartDraftResultDto> {
  return apiPost<StartDraftResultDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/draft/start`,
    body,
  );
}
