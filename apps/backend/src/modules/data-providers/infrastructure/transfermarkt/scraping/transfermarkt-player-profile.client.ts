const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

export class TransfermarktPlayerProfileClient {
  async fetchProfileHtml(playerExternalId: string): Promise<string> {
    const url = `https://www.transfermarkt.com/-/profil/spieler/${encodeURIComponent(playerExternalId)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Player profile failed (${String(response.status)}): ${url}`);
    }

    return response.text();
  }
}
