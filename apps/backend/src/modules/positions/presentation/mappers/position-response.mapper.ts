import type { PlayerPosition } from '@draft-io/shared-types';

export interface PositionResponse {
  readonly code: PlayerPosition;
}

export function toPositionResponse(code: PlayerPosition): PositionResponse {
  return { code };
}

export function toPositionResponseList(
  codes: readonly PlayerPosition[],
): readonly PositionResponse[] {
  return codes.map((code) => toPositionResponse(code));
}
