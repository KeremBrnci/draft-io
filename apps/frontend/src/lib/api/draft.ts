import type {
  DraftBoardStateDto,
  DraftPickOptionsDto,
} from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function getDraftBoard(code: string, sessionToken: string): Promise<DraftBoardStateDto> {
  const params = new URLSearchParams({ sessionToken });
  return apiGet<DraftBoardStateDto>(`/lobbies/code/${encodeURIComponent(code.toUpperCase())}/draft?${params.toString()}`);
}

export function getDraftPickOptions(
  code: string,
  sessionToken: string,
  slotIndex: number,
): Promise<DraftPickOptionsDto> {
  const params = new URLSearchParams({
    sessionToken,
    slotIndex: String(slotIndex),
  });
  return apiGet<DraftPickOptionsDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/draft/pick-options?${params.toString()}`,
  );
}

export function applyDraftPick(
  code: string,
  body: { readonly sessionToken: string; readonly slotIndex: number; readonly cardId: string },
): Promise<DraftBoardStateDto> {
  return apiPost<DraftBoardStateDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/draft/pick`,
    body,
  );
}
