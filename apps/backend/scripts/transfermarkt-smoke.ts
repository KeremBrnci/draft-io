import 'reflect-metadata';

import { loadEnvFile } from './load-env';
import { TransfermarktConfigService } from '../src/modules/data-providers/infrastructure/transfermarkt/config/transfermarkt.config';
import { TransfermarktHttpClient } from '../src/modules/data-providers/infrastructure/transfermarkt/http/transfermarkt-http.client';
import { TransfermarktCountryProvider } from '../src/modules/data-providers/infrastructure/transfermarkt/providers/transfermarkt-country.provider';
import { TransfermarktPlayerProvider } from '../src/modules/data-providers/infrastructure/transfermarkt/providers/transfermarkt-player.provider';

loadEnvFile();

async function main(): Promise<void> {
  const configService = new TransfermarktConfigService({
    get: (key: string) => process.env[key],
  } as never);

  const baseUrl = configService.getConfig().baseUrl;
  console.log(`Base URL: ${baseUrl}`);
  console.log(
    `API key: ${configService.getConfig().apiKey ? 'set (optional)' : 'not set — OK for fly.dev'}`,
  );

  const httpClient = new TransfermarktHttpClient(configService);
  const countryProvider = new TransfermarktCountryProvider();
  const playerProvider = new TransfermarktPlayerProvider(httpClient, configService);

  const countries = await countryProvider.listCountries();
  console.log(
    `Countries (seed): ${String(countries.length)} — first: ${countries[0]?.name ?? 'n/a'}`,
  );

  try {
    const players = await playerProvider.searchPlayers('messi');
    console.log(`Player search: ${String(players.length)} result(s)`);

    if (players[0] !== undefined) {
      const profile = await playerProvider.fetchProfile(players[0].externalId);
      console.log(`Profile: ${profile?.displayName ?? 'not found'}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Live player search failed: ${message}`);
    console.warn(
      'Public fly.dev may be rate-limited or blocked by Transfermarkt — try self-hosting felipeall/transfermarkt-api.',
    );
  }

  try {
    const roster = await playerProvider.fetchClubPlayers('11');
    console.log(`Club roster (Arsenal): ${String(roster.length)} player(s)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Club roster fetch failed: ${message}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
