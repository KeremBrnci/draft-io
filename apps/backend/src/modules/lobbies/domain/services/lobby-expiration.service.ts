/** Inactivity window — lobby closes if nobody interacts for this long. */
export const LOBBY_INACTIVITY_TTL_MS = 30 * 60 * 1000;

/** Hard cap from lobby creation — code cannot live longer than this. */
export const LOBBY_MAX_LIFETIME_MS = 2 * 60 * 60 * 1000;

export class LobbyExpirationService {
  initialExpiresAt(from: Date = new Date()): Date {
    const inactivityExpiry = from.getTime() + LOBBY_INACTIVITY_TTL_MS;
    const maxLifetimeExpiry = from.getTime() + LOBBY_MAX_LIFETIME_MS;
    return new Date(Math.min(inactivityExpiry, maxLifetimeExpiry));
  }

  touch(lobby: {
    readonly createdAt: Date;
    readonly phase: string;
    setExpiresAt(expiresAt: Date): void;
  }): void {
    if (lobby.phase !== 'LOBBY') {
      return;
    }

    const maxExpiry = lobby.createdAt.getTime() + LOBBY_MAX_LIFETIME_MS;
    const nextExpiry = Date.now() + LOBBY_INACTIVITY_TTL_MS;
    lobby.setExpiresAt(new Date(Math.min(maxExpiry, nextExpiry)));
  }

  isExpired(
    lobby: { readonly expiresAt: Date; readonly phase: string },
    now: Date = new Date(),
  ): boolean {
    if (lobby.phase !== 'LOBBY') {
      return false;
    }

    return now.getTime() >= lobby.expiresAt.getTime();
  }
}
