import { collapseEquivalentPositionCodes } from '@draft-io/shared-utils';
import { v4 as uuidv4 } from 'uuid';

import type { ExternalPlayerRecord } from '../../../data-providers/domain/models/external-player-record';
import { normalizeExternalPositionCode } from '../../../positions/application/normalize-external-position-code';
import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';
import type { PlayerId } from '../../domain/value-objects/player-id.vo';
import { PlayerPositionId } from '../../domain/value-objects/player-position-id.vo';
import { PlayerPositions } from '../../domain/value-objects/player-positions.vo';

/**
 * Maps provider primary + secondary position strings into a validated PlayerPositions set.
 * Single-position imports produce one assignment with isPrimary=true.
 */
export function mapExternalPlayerPositions(
  playerId: PlayerId,
  record: Pick<ExternalPlayerRecord, 'primaryPosition' | 'secondaryPositions'>,
): PlayerPositions {
  const normalizedPrimary = normalizeExternalPositionCode(record.primaryPosition) ?? 'CM';
  const normalizedSecondary = record.secondaryPositions
    .map((code) => normalizeExternalPositionCode(code))
    .filter((code): code is PositionCode => code !== null);
  const { primary, secondary } = collapseEquivalentPositionCodes(
    normalizedPrimary,
    normalizedSecondary,
  );

  return PlayerPositions.fromPrimaryAndSecondary(
    playerId,
    () => PlayerPositionId.generate(uuidv4()),
    primary,
    secondary,
  );
}
