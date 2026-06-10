/**
 * Future extension point for event and promotion-specific card data.
 * Not persisted in this sprint — see docs/architecture/card-template-system.md.
 *
 * Examples: TOTY season, World Cup event, Road To Final stage.
 */
export interface CardMetadata {
  readonly eventName?: string;
  readonly seasonName?: string;
  readonly promoName?: string;
  readonly campaignCode?: string;
  readonly attributes?: Readonly<Record<string, string | number | boolean>>;
}
