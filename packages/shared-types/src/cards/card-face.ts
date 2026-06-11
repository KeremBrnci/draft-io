/** Visual edition families — maps to future `CardType.code` values. */
export type CardVariant = 'base' | 'hero' | 'icon' | 'toty' | 'event';

export type CardEntityKind = 'player' | 'coach';

/**
 * Normalized face data for the collectible card shell.
 * Gameplay stats and template assets compose on top of this in later phases.
 */
export interface CardFaceData {
  readonly displayName: string;
  readonly imageUrl: string | null;
  /** Player overall or null for coaches / unrated entities. */
  readonly rating: number | null;
  /** Shown when `rating` is null (e.g. coach badge). */
  readonly ratingFallback?: string;
  /** Short label under rating — position code or role. */
  readonly subtitle: string;
  readonly nationalityFlagUrl: string | null;
  readonly nationalityLabel?: string;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
}

export interface CardTemplateTheme {
  readonly variant: CardVariant;
  readonly label: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly animationKey: string;
}
