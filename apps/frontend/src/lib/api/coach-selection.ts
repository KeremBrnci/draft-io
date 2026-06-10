import type { CoachSelectionStateDto } from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function getCoachSelection(
  code: string,
  sessionToken: string,
): Promise<CoachSelectionStateDto> {
  const params = new URLSearchParams({ sessionToken });
  return apiGet<CoachSelectionStateDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/coach-selection?${params.toString()}`,
  );
}

export function selectCoach(
  code: string,
  body: { readonly sessionToken: string; readonly coachId: string },
): Promise<CoachSelectionStateDto> {
  return apiPost<CoachSelectionStateDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/coach-selection/select`,
    body,
  );
}
