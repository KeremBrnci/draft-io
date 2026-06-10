import { Injectable } from '@nestjs/common';

import {
  ProviderConfigurationError,
  ProviderRateLimitError,
  ProviderResponseError,
  ProviderTransportError,
} from '../../../domain/errors/data-provider.errors';
import { TokenBucketRateLimiter } from '../../sportdb/http/token-bucket-rate-limiter';
import { TransfermarktConfigService } from '../config/transfermarkt.config';

export type FetchFn = typeof fetch;

export interface TransfermarktHttpClientOptions {
  readonly fetchFn?: FetchFn;
}

@Injectable()
export class TransfermarktHttpClient {
  private fetchFn: FetchFn;
  private rateLimiter: TokenBucketRateLimiter | null = null;

  constructor(private readonly configService: TransfermarktConfigService) {
    this.fetchFn = fetch;
  }

  /** Test-only hook — not used by Nest DI. */
  withFetchFn(fetchFn: FetchFn): this {
    this.fetchFn = fetchFn;
    return this;
  }

  async getJson<T>(path: string): Promise<T> {
    const config = this.configService.getConfig();

    const limiter = this.getRateLimiter(config.requestsPerSecond);
    await limiter.acquire();

    const url = new URL(path, config.baseUrl.endsWith('/') ? config.baseUrl : `${config.baseUrl}/`);

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
      lastError instanceof Error ? lastError.message : 'Transfermarkt request failed',
    );
  }

  private async fetchWithTimeout(
    url: string,
    timeoutMs: number,
    apiKey: string | undefined,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (apiKey !== undefined && apiKey.length > 0) {
      headers['X-API-Key'] = apiKey;
    }

    try {
      return await this.fetchFn(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderTransportError(
          `Transfermarkt request timed out after ${String(timeoutMs)}ms`,
        );
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
      return new ProviderConfigurationError(
        `Transfermarkt authentication failed (${String(status)})`,
      );
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
