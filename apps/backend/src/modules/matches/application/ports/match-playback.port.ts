export interface MatchPlaybackPort {
  startPlayback(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
  }): Promise<void>;

  ensurePlaybackRunning(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
    readonly status: string;
  }): Promise<void>;
}

export const MATCH_PLAYBACK_PORT = Symbol('MATCH_PLAYBACK_PORT');
