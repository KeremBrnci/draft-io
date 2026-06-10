import { describe, expect, it } from 'vitest';

import {
  mapScrapedSquadPlayerToExternalRecord,
  parseTransfermarktMarketValue,
  parseTransfermarktSquadPage,
} from './transfermarkt-squad-page.parser';

const VITINHA_ROW = `<tr class="odd theme6">
<td class="zentriert rueckennummer bg_Mittelfeld"><div class=rn_nummer>17</div></td><td class="posrela">
<table class="inline-table">
    <tr>
        <td rowspan="2">
            <img data-src="https://img.a.transfermarkt.technology/portrait/medium/487469-1749415169.jpg?lm=1" title="Vitinha" alt="Vitinha" class="bilderrahmen-fixed lazy lazy" />
        </td>
        <td class="hauptlink">
            <a href="/vitinha/profil/spieler/487469">Vitinha</a>
        </td>
    </tr>
    <tr>
        <td>Defensive Midfield</td>
    </tr>
</table>
</td><td class="zentriert">13/02/2000 (26)</td><td class="zentriert"><img title="Portugal" alt="Portugal" class="flaggenrahmen" /></td><td class="rechts hauptlink"><a>€140.00m</a></td></tr>`;

describe('transfermarkt-squad-page.parser', () => {
  it('parses market values', () => {
    expect(parseTransfermarktMarketValue('€140.00m')).toBe(140_000_000);
    expect(parseTransfermarktMarketValue('€800k')).toBe(800_000);
    expect(parseTransfermarktMarketValue('-')).toBeNull();
  });

  it('parses squad rows into player snapshots', () => {
    const players = parseTransfermarktSquadPage(VITINHA_ROW);

    expect(players).toHaveLength(1);
    expect(players[0]).toMatchObject({
      externalId: '487469',
      displayName: 'Vitinha',
      position: 'Defensive Midfield',
      nationality: 'Portugal',
      marketValue: 140_000_000,
      dateOfBirth: '2000-02-13',
      age: 26,
    });
    expect(players[0]?.imageUrl).toContain('487469-1749415169');
  });

  it('maps scraped players to external records', () => {
    const [player] = parseTransfermarktSquadPage(VITINHA_ROW);
    const record = mapScrapedSquadPlayerToExternalRecord(player, '583', 'FR1');

    expect(record.externalId).toBe('487469');
    expect(record.teamExternalId).toBe('583');
    expect(record.leagueExternalId).toBe('FR1');
    expect(record.primaryPosition).toBe('CDM');
  });
});
