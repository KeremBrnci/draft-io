import type { ApiResponse, PaginatedResponse } from '@draft-io/shared-types';

import {
  isRetryableResponseStatus,
  isTransientApiError,
  normalizeApiErrorMessage,
  sleep,
} from '@/lib/api/resilience';

const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1');

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface ApiErrorBody {
  readonly message?: string;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // ignore parse errors
  }

  return response.statusText || 'İstek başarısız oldu';
}

const API_REQUEST_TIMEOUT_MS = 30_000;
const API_MAX_RETRIES = 2;
const API_RETRY_DELAYS_MS = [250, 750] as const;

async function requestOnce(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiClientError('Sunucu yanıt vermedi. Biraz bekleyip tekrar dene.', 0);
    }
    if (error instanceof TypeError) {
      throw new ApiClientError(
        'API bağlantısı kurulamadı. Terminalde `pnpm dev` çalıştığından emin olun.',
        0,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= API_MAX_RETRIES; attempt += 1) {
    try {
      const response = await requestOnce(url, init);
      if (!isRetryableResponseStatus(response.status) || attempt === API_MAX_RETRIES) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === API_MAX_RETRIES || !isTransientApiError(error)) {
        throw error;
      }
    }

    await sleep(API_RETRY_DELAYS_MS[attempt] ?? 750);
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new ApiClientError('İstek başarısız oldu.', 0);
}

function throwApiClientError(message: string, statusCode: number): never {
  throw new ApiClientError(
    normalizeApiErrorMessage(new ApiClientError(message, statusCode), message),
    statusCode,
  );
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await request(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throwApiClientError(message, response.status);
  }

  const envelope = (await response.json()) as ApiResponse<T>;
  return envelope.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await request(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throwApiClientError(message, response.status);
  }

  const envelope = (await response.json()) as ApiResponse<T>;
  return envelope.data;
}

export async function apiGetPaginated<T>(path: string): Promise<PaginatedResponse<T>> {
  const response = await request(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throwApiClientError(message, response.status);
  }

  return response.json() as Promise<PaginatedResponse<T>>;
}
