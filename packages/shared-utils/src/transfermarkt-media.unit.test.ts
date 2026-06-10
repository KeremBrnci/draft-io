import { describe, expect, it } from 'vitest';

import {
  buildTransfermarktLeagueLogoUrl,
  buildTransfermarktNationalityFlagUrl,
  buildTransfermarktPlayerPortraitUrl,
  buildTransfermarktTeamLogoUrl,
  extractTransfermarktPortraitUrlsFromHtml,
  normalizeTransfermarktPortraitUrl,
  resolveTransfermarktCountryId,
  resolveTransfermarktPlayerImageUrl,
} from './transfermarkt-media';

describe('transfermarkt-media', () => {
  it('builds portrait URLs with version hash and normalizes sizes', () => {
    expect(buildTransfermarktPlayerPortraitUrl('418560', '1709108116', 'png')).toBe(
      'https://img.a.transfermarkt.technology/portrait/header/418560-1709108116.png?lm=1',
    );
    expect(buildTransfermarktPlayerPortraitUrl('303254')).toBeNull();
    expect(
      normalizeTransfermarktPortraitUrl(
        'https://img.a.transfermarkt.technology/portrait/medium/591949-1780070754.jpg?lm=1',
      ),
    ).toBe('https://img.a.transfermarkt.technology/portrait/header/591949-1780070754.jpg?lm=1');
    expect(buildTransfermarktTeamLogoUrl('281')).toBe(
      'https://tmssl.akamaized.net//images/wappen/verysmall/281.png',
    );
    expect(buildTransfermarktLeagueLogoUrl('GB1')).toBe(
      'https://tmssl.akamaized.net//images/logo/normal/gb1.png',
    );
  });

  it('resolves nationality aliases to Transfermarkt country ids', () => {
    expect(resolveTransfermarktCountryId('ENGLAND')).toBe('189');
    expect(resolveTransfermarktCountryId("COTE D'IVOIRE")).toBe('38');
    expect(resolveTransfermarktCountryId('THE GAMBIA')).toBe('52');
    expect(resolveTransfermarktCountryId('KOREA, SOUTH')).toBe('87');
    expect(resolveTransfermarktCountryId('TÜRKIYE')).toBe('174');
  });

  it('builds flag URLs for normalized nationalities', () => {
    expect(buildTransfermarktNationalityFlagUrl('SPAIN')).toBe(
      'https://tmssl.akamaized.net//images/flagge/verysmall/157.png',
    );
  });

  it('resolves stored portrait URLs and ignores legacy tmssl fallbacks', () => {
    expect(
      resolveTransfermarktPlayerImageUrl(
        'https://img.a.transfermarkt.technology/portrait/medium/591949-1780070754.jpg?lm=1',
        '591949',
      ),
    ).toBe('https://img.a.transfermarkt.technology/portrait/header/591949-1780070754.jpg?lm=1');
    expect(resolveTransfermarktPlayerImageUrl(null, '303254')).toBeNull();
  });

  it('extracts portrait URLs from squad HTML', () => {
    const html =
      '<img data-src="https://img.a.transfermarkt.technology/portrait/medium/418560-1709108116.png?lm=1" />';
    const portraits = extractTransfermarktPortraitUrlsFromHtml(html);

    expect(portraits.get('418560')).toBe(
      'https://img.a.transfermarkt.technology/portrait/header/418560-1709108116.png?lm=1',
    );
  });
});
