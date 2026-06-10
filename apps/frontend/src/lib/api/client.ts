import type { ApiResponse, PaginatedResponse } from '@draft-io/shared-types';

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

async function request(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiClientError(
        'API bağlantısı kurulamadı. Terminalde `pnpm dev` çalıştığından emin olun.',
        0,
      );
    }

    throw error;
  }
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
    throw new ApiClientError(message, response.status);
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
    throw new ApiClientError(message, response.status);
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
    throw new ApiClientError(message, response.status);
  }

  return response.json() as Promise<PaginatedResponse<T>>;
}
