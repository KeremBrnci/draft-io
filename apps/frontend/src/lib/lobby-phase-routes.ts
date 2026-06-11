import type { RoomPhaseDto } from '@draft-io/shared-types';

const PHASE_ROUTE_SUFFIX: Partial<Record<RoomPhaseDto, string>> = {
  FORMATION_SELECTION: '/formation',
  DRAFT: '/draft',
  COACH_SELECTION: '/coach-selection',
  TEAM_REVIEW: '/team-review',
  MATCHES: '/league',
};

export function routeForRoomPhase(code: string, phase: RoomPhaseDto): string | null {
  const suffix = PHASE_ROUTE_SUFFIX[phase];
  if (suffix === undefined) {
    return null;
  }

  return `/play/room/${code}${suffix}`;
}
