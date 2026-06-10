const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

export class TransfermarktSquadPageClient {
  async fetchSquadHtml(clubExternalId: string, seasonId: string): Promise<string> {
    const url = `https://www.transfermarkt.com/-/kader/verein/${encodeURIComponent(clubExternalId)}/saison_id/${encodeURIComponent(seasonId)}/plus/1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Squad page failed (${String(response.status)}): ${url}`);
    }

    return response.text();
  }
}
