import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TransfermarktConfig {
  readonly apiKey: string | undefined;
  readonly baseUrl: string;
  readonly seasonId: string | undefined;
  readonly requestsPerSecond: number;
  readonly timeoutMs: number;
  readonly retryAttempts: number;
}

@Injectable()
export class TransfermarktConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): TransfermarktConfig {
    return {
      apiKey: this.configService.get<string>('TRANSFERMARKT_API_KEY'),
      baseUrl:
        this.configService.get<string>('TRANSFERMARKT_BASE_URL') ??
        'https://transfermarkt-api.fly.dev',
      seasonId: this.configService.get<string>('TRANSFERMARKT_SEASON_ID'),
      requestsPerSecond: this.configService.get<number>('TRANSFERMARKT_RPS_LIMIT') ?? 2,
      timeoutMs: this.configService.get<number>('TRANSFERMARKT_TIMEOUT_MS') ?? 10_000,
      retryAttempts: this.configService.get<number>('TRANSFERMARKT_RETRY_ATTEMPTS') ?? 2,
    };
  }

  isConfigured(): boolean {
    return Boolean(this.getConfig().baseUrl);
  }
}
