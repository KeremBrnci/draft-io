/** Commentary feed — goals, cards, shots and phase changes only. */
const IMPORTANT_MATCH_EVENT_TYPES = new Set<string>([
  'KICK_OFF',
  'HALF_TIME',
  'FULL_TIME',
  'GOAL',
  'OFFSIDE_GOAL',
  'PENALTY',
  'MISSED_PENALTY',
  'SHOT',
  'SHOT_ON_TARGET',
  'WOODWORK',
  'YELLOW_CARD',
  'RED_CARD',
]);

export function isImportantMatchEvent(eventType: string): boolean {
  return IMPORTANT_MATCH_EVENT_TYPES.has(eventType);
}
