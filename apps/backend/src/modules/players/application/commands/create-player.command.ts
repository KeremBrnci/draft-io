export interface CreatePlayerCommand {
  readonly name: string;
  readonly position: string;
  readonly nationality?: string;
}
