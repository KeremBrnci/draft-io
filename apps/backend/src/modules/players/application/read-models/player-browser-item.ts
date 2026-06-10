import type { PlayerPositionAssignmentDto } from '@draft-io/shared-types';

import type { Position } from '../../../positions/domain/value-objects/position.vo';
import type { PlayerStatus } from '../../domain/enums/player-status.enum';

export interface PlayerBrowserItem {
  readonly id: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly positions: readonly PlayerPositionAssignmentDto[];
  readonly position: Position['value'];
  readonly secondaryPositions: readonly Position['value'][];
  readonly nationality: string;
  readonly nationalityFlagUrl: string | null;
  readonly age: number | null;
  readonly marketValue: number | null;
  readonly teamId: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueId: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
  readonly overall: number | null;
  readonly status: PlayerStatus;
}
