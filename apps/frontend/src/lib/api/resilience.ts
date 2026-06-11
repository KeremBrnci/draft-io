const TRANSIENT_STATUS_CODES = new Set([0, 408, 429, 502, 503, 504]);

function readStatusCode(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return null;
  }

  const statusCode = (error as { readonly statusCode: unknown }).statusCode;
  return typeof statusCode === 'number' ? statusCode : null;
}

function readErrorMessage(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('message' in error)) {
    return null;
  }

  const message = (error as { readonly message: unknown }).message;
  return typeof message === 'string' ? message : null;
}

export function isTransientApiError(error: unknown): boolean {
  const statusCode = readStatusCode(error);
  return statusCode !== null && TRANSIENT_STATUS_CODES.has(statusCode);
}

export function isLobbyGoneError(error: unknown): boolean {
  const statusCode = readStatusCode(error);
  return statusCode === 404 || statusCode === 410;
}

export function normalizeApiErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = readErrorMessage(error);
  if (message === null) {
    return fallbackMessage;
  }

  if (message.startsWith('Backend request failed:') || message.includes('Bad Gateway')) {
    return 'Sunucuya geçici olarak ulaşılamadı.';
  }

  if (isTransientApiError(error)) {
    return 'Bağlantı geçici olarak kesildi.';
  }

  return message.length > 0 ? message : fallbackMessage;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isRetryableResponseStatus(status: number): boolean {
  return TRANSIENT_STATUS_CODES.has(status);
}
