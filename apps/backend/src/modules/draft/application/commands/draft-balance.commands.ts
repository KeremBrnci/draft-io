export interface GeneratePickOptionsCommand {
  readonly lobbyId: string;
  readonly participantId: string;
  readonly positionCode: string;
  readonly positionCodes?: readonly string[];
}

export interface ApplyDraftPickCommand {
  readonly lobbyId: string;
  readonly participantId: string;
  readonly cardId: string;
  readonly positionCode: string;
  readonly positionCodes?: readonly string[];
  readonly slotAssignment?: {
    readonly slotIndex: number;
    readonly slotLabel: string;
  };
}

export interface CalculateTeamStrengthCommand {
  readonly cardIds: readonly string[];
}

export interface SimulateDraftFairnessCommand {
  readonly participantCount?: number;
  readonly runCount?: number;
  readonly seed?: number;
}
