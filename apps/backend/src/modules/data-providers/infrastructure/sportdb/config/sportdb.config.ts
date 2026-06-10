import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SportDbConfig {
  readonly apiKey: string | undefined;
  readonly baseUrl: string;
  readonly requestsPerSecond: number;
  readonly timeoutMs: number;
  readonly retryAttempts: number;
}

@Injectable()
export class SportDbConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): SportDbConfig {
    return {
      apiKey: this.configService.get<string>('SPORTDB_API_KEY'),
      baseUrl:
        this.configService.get<string>('SPORTDB_BASE_URL') ??
        'https://api.sportdb.dev/api/flashscore',
      requestsPerSecond: this.configService.get<number>('SPORTDB_RPS_LIMIT') ?? 2,
      timeoutMs: this.configService.get<number>('SPORTDB_TIMEOUT_MS') ?? 10_000,
      retryAttempts: this.configService.get<number>('SPORTDB_RETRY_ATTEMPTS') ?? 2,
    };
  }

  isConfigured(): boolean {
    return Boolean(this.getConfig().apiKey);
  }
}
