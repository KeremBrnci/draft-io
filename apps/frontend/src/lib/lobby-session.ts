const SESSIONS_KEY = 'draft-io-lobby-sessions';
const DISPLAY_NAME_KEY = 'draft-io-display-name';
const LEGACY_SESSION_KEY = 'draft-io-lobby-session';

export interface StoredLobbySession {
  readonly lobbyCode: string;
  readonly participantId: string;
  readonly sessionToken: string;
  readonly displayName: string;
  readonly savedAt: string;
}

type SessionStore = Record<string, StoredLobbySession>;

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function readStore(): SessionStore {
  if (typeof window === 'undefined') {
    return {};
  }

  migrateLegacySession();

  const raw = window.localStorage.getItem(SESSIONS_KEY);
  if (raw === null) {
    return {};
  }

  try {
    return JSON.parse(raw) as SessionStore;
  } catch {
    return {};
  }
}

function writeStore(store: SessionStore): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(store));
}

function migrateLegacySession(): void {
  const legacy = window.localStorage.getItem(LEGACY_SESSION_KEY);
  if (legacy === null) {
    return;
  }

  try {
    const session = JSON.parse(legacy) as Partial<StoredLobbySession> &
      Pick<StoredLobbySession, 'lobbyCode' | 'participantId' | 'sessionToken' | 'displayName'>;
    const code = normalizeCode(session.lobbyCode);
    const store = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) ?? '{}') as SessionStore;
    store[code] = {
      ...session,
      lobbyCode: code,
      savedAt: session.savedAt ?? new Date().toISOString(),
    };
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(store));
  } catch {
    // ignore invalid legacy payload
  }

  window.localStorage.removeItem(LEGACY_SESSION_KEY);
}

export function saveLobbySession(session: Omit<StoredLobbySession, 'savedAt'>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const code = normalizeCode(session.lobbyCode);
  const store = readStore();

  store[code] = {
    ...session,
    lobbyCode: code,
    savedAt: new Date().toISOString(),
  };

  writeStore(store);
  saveDisplayName(session.displayName);
}

export function readLobbySession(lobbyCode: string): StoredLobbySession | null {
  const code = normalizeCode(lobbyCode);
  const store = readStore();
  return store[code] ?? null;
}

export function clearLobbySession(lobbyCode: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const code = normalizeCode(lobbyCode);
  const store = readStore();
  const { [code]: _removed, ...rest } = store;
  writeStore(rest);
}

export function saveDisplayName(displayName: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DISPLAY_NAME_KEY, displayName.trim());
}

export function readSavedDisplayName(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(DISPLAY_NAME_KEY) ?? '';
}

export function listSavedLobbyCodes(): string[] {
  return Object.keys(readStore());
}
