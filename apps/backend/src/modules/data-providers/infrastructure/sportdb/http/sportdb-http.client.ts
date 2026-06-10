import { Injectable } from '@nestjs/common';

import {
  ProviderConfigurationError,
  ProviderRateLimitError,
  ProviderResponseError,
  ProviderTransportError,
} from '../../../domain/errors/data-provider.errors';
import { SportDbConfigService } from '../config/sportdb.config';
import { TokenBucketRateLimiter } from './token-bucket-rate-limiter';

export type FetchFn = typeof fetch;

export interface SportDbHttpClientOptions {
  readonly fetchFn?: FetchFn;
}

@Injectable()
export class SportDbHttpClient {
  private fetchFn: FetchFn;
  private rateLimiter: TokenBucketRateLimiter | null = null;

  constructor(private readonly configService: SportDbConfigService) {
    this.fetchFn = fetch;
  }

  /** Test-only hook — not used by Nest DI. */
  withFetchFn(fetchFn: FetchFn): this {
    this.fetchFn = fetchFn;
    return this;
  }

  async getJson<T>(path: string, query?: Record<string, string>): Promise<T> {
    const config = this.configService.getConfig();

    if (!config.apiKey) {
      throw new ProviderConfigurationError(
        'SPORTDB_API_KEY is not configured. Set the environment variable to enable SportDB requests.',
      );
    }

    const limiter = this.getRateLimiter(config.requestsPerSecond);
    await limiter.acquire();

    const url = new URL(path, config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`);

    if (query !== undefined) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= config.retryAttempts; attempt += 1) {
      try {
        const response = await this.fetchWithTimeout(url.toString(), config.timeoutMs, config.apiKey);

        if (response.ok) {
          return (await response.json()) as T;
        }

        if (!this.shouldRetry(response.status) || attempt === config.retryAttempts) {
          throw this.mapHttpError(response.status, await safeReadBody(response));
        }

        await backoff(attempt);
      } catch (error) {
        if (
          error instanceof ProviderResponseError ||
          error instanceof ProviderConfigurationError ||
          error instanceof ProviderRateLimitError
        ) {
          throw error;
        }

        lastError = error;

        if (attempt === config.retryAttempts) {
          break;
        }

        await backoff(attempt);
      }
    }

    throw new ProviderTransportError(
      lastError instanceof Error ? lastError.message : 'SportDB request failed',
    );
  }

  private async fetchWithTimeout(
    url: string,
    timeoutMs: number,
    apiKey: string,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      return await this.fetchFn(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Key': apiKey,
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderTransportError(`SportDB request timed out after ${String(timeoutMs)}ms`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private shouldRetry(status: number): boolean {
    return status === 429 || (status >= 500 && status <= 599);
  }

  private mapHttpError(status: number, body: string): Error {
    if (status === 429) {
      return new ProviderRateLimitError();
    }

    if (status === 401 || status === 403) {
      return new ProviderConfigurationError(`SportDB authentication failed (${String(status)})`);
    }

    if (status === 404) {
      return new ProviderResponseError(status, 'Resource not found');
    }

    return new ProviderResponseError(status, body || 'Request failed');
  }

  private getRateLimiter(requestsPerSecond: number): TokenBucketRateLimiter {
    if (this.rateLimiter === null) {
      this.rateLimiter = TokenBucketRateLimiter.fromRequestsPerSecond(requestsPerSecond);
    }

    return this.rateLimiter;
  }
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function backoff(attempt: number): Promise<void> {
  const delayMs = 250 * (attempt + 1);
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
