import 'reflect-metadata';

import { SportDbConfigService } from '../src/modules/data-providers/infrastructure/sportdb/config/sportdb.config';
import { SportDbHttpClient } from '../src/modules/data-providers/infrastructure/sportdb/http/sportdb-http.client';
import { SportDbPlayerProvider } from '../src/modules/data-providers/infrastructure/sportdb/providers/sportdb-player.provider';

async function main(): Promise<void> {
  const configService = new SportDbConfigService({
    get: (key: string) => process.env[key],
  } as never);

  if (!configService.isConfigured()) {
    console.error('SPORTDB_API_KEY is not set. Skipping live SportDB smoke test.');
    process.exit(0);
  }

  const httpClient = new SportDbHttpClient(configService);
  const playerProvider = new SportDbPlayerProvider(httpClient);

  const results = await playerProvider.searchPlayers('messi');
  console.log(`Search returned ${String(results.length)} player(s)`);

  if (results[0] !== undefined) {
    const detail = await playerProvider.fetchBySlugAndId(results[0].slug, results[0].externalId);
    console.log(`Detail: ${detail?.displayName ?? 'not found'}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
