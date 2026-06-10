import type { PlayerSummary } from '@draft-io/shared-types';

/**
 * API response shape for a single player.
 * Mapping from domain is done in presentation/mappers — not here.
 */
export type PlayerResponseDto = PlayerSummary;
