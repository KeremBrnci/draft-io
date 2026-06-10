import type { MatchEventTypeDto } from '@draft-io/shared-types';

export interface MatchEventUiMeta {
  readonly icon: string;
  readonly label: string;
  readonly tone: 'neutral' | 'attack' | 'shot' | 'goal' | 'card' | 'whistle';
}

const EVENT_UI: Record<MatchEventTypeDto, MatchEventUiMeta> = {
  KICK_OFF: { icon: '⚽', label: 'Başlangıç', tone: 'whistle' },
  HALF_TIME: { icon: '⏸️', label: 'Devre arası', tone: 'whistle' },
  FULL_TIME: { icon: '🏁', label: 'Maç sonu', tone: 'whistle' },
  DANGEROUS_ATTACK: { icon: '⚡', label: 'Tehlikeli atak', tone: 'attack' },
  GOAL_CHANCE: { icon: '🔥', label: 'Gol pozisyonu', tone: 'goal' },
  CORNER: { icon: '🚩', label: 'Korner', tone: 'attack' },
  FREE_KICK: { icon: '🎯', label: 'Serbest vuruş', tone: 'shot' },
  SHOT: { icon: '👟', label: 'Şut', tone: 'shot' },
  SHOT_ON_TARGET: { icon: '🧤', label: 'İsabetli şut', tone: 'shot' },
  GOAL: { icon: '⚽', label: 'Gol', tone: 'goal' },
  OFFSIDE_GOAL: { icon: '🚫', label: 'Ofsayt gol', tone: 'neutral' },
  PENALTY: { icon: '⚠️', label: 'Penaltı', tone: 'shot' },
  MISSED_PENALTY: { icon: '❌', label: 'Kaçan penaltı', tone: 'shot' },
  WOODWORK: { icon: '🪵', label: 'Direk', tone: 'shot' },
  YELLOW_CARD: { icon: '🟨', label: 'Sarı kart', tone: 'card' },
  RED_CARD: { icon: '🟥', label: 'Kırmızı kart', tone: 'card' },
};

export function getMatchEventUi(eventType: MatchEventTypeDto): MatchEventUiMeta {
  return EVENT_UI[eventType];
}
