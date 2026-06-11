export function resolveBackendUrl(): string {
  const raw = process.env.BACKEND_URL?.trim();
  if (!raw) {
    return 'http://localhost:3001';
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'http://localhost:3001';
    }
    return parsed.origin;
  } catch {
    return 'http://localhost:3001';
  }
}
