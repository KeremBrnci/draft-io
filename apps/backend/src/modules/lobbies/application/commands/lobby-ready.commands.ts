export interface SetParticipantReadyCommand {
  readonly code: string;
  readonly sessionToken: string;
  readonly isReady: boolean;
}

export interface StartLobbyCommand {
  readonly code: string;
  readonly sessionToken: string;
}
