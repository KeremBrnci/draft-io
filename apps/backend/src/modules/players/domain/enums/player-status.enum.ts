export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  INJURED = 'INJURED',
  SUSPENDED = 'SUSPENDED',
  RETIRED = 'RETIRED',
  UNKNOWN = 'UNKNOWN',
}

export const ALL_PLAYER_STATUSES: readonly PlayerStatus[] = [
  PlayerStatus.ACTIVE,
  PlayerStatus.INJURED,
  PlayerStatus.SUSPENDED,
  PlayerStatus.RETIRED,
  PlayerStatus.UNKNOWN,
] as const;

export function parsePlayerStatus(value: string): PlayerStatus {
  const normalized = value.toUpperCase();

  if (ALL_PLAYER_STATUSES.includes(normalized as PlayerStatus)) {
    return normalized as PlayerStatus;
  }

  return PlayerStatus.UNKNOWN;
}
