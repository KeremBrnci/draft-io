export interface CreateLobbyCommand {
  readonly name: string;
  readonly displayName: string;
  readonly maxPlayers?: number;
}
