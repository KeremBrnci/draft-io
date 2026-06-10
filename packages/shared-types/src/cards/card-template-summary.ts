export interface CardTemplateSummary {
  readonly id: string;
  readonly cardTypeId: string;
  readonly name: string;
  readonly backgroundImage: string | null;
  readonly borderImage: string | null;
  readonly animationKey: string | null;
  readonly primaryColor: string | null;
  readonly secondaryColor: string | null;
  readonly isActive: boolean;
}
