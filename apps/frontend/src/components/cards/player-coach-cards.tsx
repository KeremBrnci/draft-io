import type { CoachBrowserItemDto } from '@draft-io/shared-types';
import type { CardFaceData } from '@draft-io/shared-types';
import {
  deduplicatePlayerPositionAssignmentsForDisplay,
  translateCoachRole,
  translateNationality,
  translatePositionCode,
} from '@draft-io/shared-utils';
import { memo } from 'react';

import { FootballCard, type FootballCardProps } from './football-card';

export function mapCoachToCardFace(coach: CoachBrowserItemDto): CardFaceData {
  return {
    displayName: coach.displayName,
    imageUrl: coach.imageUrl,
    rating: null,
    ratingFallback: 'TD',
    subtitle: translateCoachRole(coach.role) || 'Teknik Direktör',
    nationalityFlagUrl: coach.nationalityFlagUrl,
    nationalityLabel: translateNationality(coach.nationality),
    leagueName: coach.leagueName,
    leagueLogoUrl: coach.leagueLogoUrl,
  };
}

export interface CoachCardProps extends Omit<FootballCardProps, 'face' | 'entityKind'> {
  readonly coach: CoachBrowserItemDto;
}

export const CoachCard = memo(function CoachCard({
  coach,
  ...cardProps
}: CoachCardProps): React.ReactElement {
  return <FootballCard face={mapCoachToCardFace(coach)} entityKind="coach" {...cardProps} />;
});

export function mapPlayerToCardFace(player: {
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly overall: number | null;
  readonly position: string;
  readonly positions?: readonly { readonly positionCode: string; readonly isPrimary: boolean }[];
  readonly nationality: string;
  readonly nationalityFlagUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
  readonly leagueId?: string | null;
}): CardFaceData {
  const primaryAssignment =
    player.positions?.find((assignment) => assignment.isPrimary) ?? player.positions?.[0];
  const positionCode = primaryAssignment?.positionCode ?? player.position;
  const subtitle = translatePositionCode(positionCode);

  return {
    displayName: player.displayName,
    imageUrl: player.imageUrl,
    rating: player.overall,
    subtitle,
    nationalityFlagUrl: player.nationalityFlagUrl,
    nationalityLabel: translateNationality(player.nationality),
    leagueName: player.leagueName,
    leagueLogoUrl: player.leagueLogoUrl,
  };
}

export interface PlayerCardProps extends Omit<FootballCardProps, 'face' | 'entityKind'> {
  readonly player: Parameters<typeof mapPlayerToCardFace>[0];
}

export function PlayerCard({ player, ...cardProps }: PlayerCardProps): React.ReactElement {
  return <FootballCard face={mapPlayerToCardFace(player)} entityKind="player" {...cardProps} />;
}

export function resolvePrimaryPositionSubtitle(
  positions: readonly { readonly positionCode: string; readonly isPrimary: boolean }[],
  fallback: string,
): string {
  const primary = deduplicatePlayerPositionAssignmentsForDisplay(positions).find(
    (assignment) => assignment.isPrimary,
  );

  if (primary === undefined) {
    return translatePositionCode(fallback);
  }

  return translatePositionCode(primary.positionCode);
}
