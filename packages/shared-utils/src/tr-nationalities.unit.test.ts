import { describe, expect, it } from 'vitest';

import { translateNationality } from './tr-football-display';

/** Every nationality currently stored in the imported player dataset. */
const IMPORTED_NATIONALITIES = [
  'SPAIN',
  'NETHERLANDS',
  'FRANCE',
  'TÜRKIYE',
  'GERMANY',
  'ENGLAND',
  'PORTUGAL',
  'ITALY',
  'BRAZIL',
  'ARGENTINA',
  'BELGIUM',
  'MOROCCO',
  'DENMARK',
  "COTE D'IVOIRE",
  'SENEGAL',
  'SWEDEN',
  'NIGERIA',
  'SWITZERLAND',
  'NORWAY',
  'CROATIA',
  'POLAND',
  'GHANA',
  'AUSTRIA',
  'URUGUAY',
  'SERBIA',
  'JAPAN',
  'UNITED STATES',
  'MALI',
  'GREECE',
  'CAMEROON',
  'ALGERIA',
  'COLOMBIA',
  'BOSNIA-HERZEGOVINA',
  'CZECH REPUBLIC',
  'SURINAME',
  'SCOTLAND',
  'IRELAND',
  'UKRAINE',
  'ROMANIA',
  'DR CONGO',
  'ICELAND',
  'CURACAO',
  'SLOVAKIA',
  'KOSOVO',
  'WALES',
  'CAPE VERDE',
  'GEORGIA',
  'ALBANIA',
  'HUNGARY',
  'ANGOLA',
  'CANADA',
  'THE GAMBIA',
  'KOREA, SOUTH',
  'AUSTRALIA',
  'ECUADOR',
  'BURKINA FASO',
  'GUINEA',
  'INDONESIA',
  'ISRAEL',
  'TUNISIA',
  'VENEZUELA',
  'CHILE',
  'GUINEA-BISSAU',
  'PARAGUAY',
  'SLOVENIA',
  'RUSSIA',
  'FINLAND',
  'MEXICO',
  'EGYPT',
  'TOGO',
  'GABON',
  'MONTENEGRO',
  'HAITI',
  'LUXEMBOURG',
  'JAMAICA',
  'BULGARIA',
  'MOZAMBIQUE',
  'NORTHERN IRELAND',
  'BENIN',
  'UZBEKISTAN',
  'COMOROS',
  'NORTH MACEDONIA',
  'ZIMBABWE',
  'HONDURAS',
  'CONGO',
  'MAURITANIA',
  'LIBYA',
  'DOMINICAN REPUBLIC',
  'COSTA RICA',
  'ZAMBIA',
  'NEW ZEALAND',
  'GUADELOUPE',
  'SOUTH AFRICA',
  'ESTONIA',
  'LITHUANIA',
  'NIGER',
  'EQUATORIAL GUINEA',
  'TRINIDAD AND TOBAGO',
  'CENTRAL AFRICAN REPUBLIC',
  'TANZANIA',
  'PUERTO RICO',
  'LATVIA',
  'CHAD',
  'MOLDOVA',
  'MALAYSIA',
  'SAUDI ARABIA',
  'FRENCH GUIANA',
  'MADAGASCAR',
  'JORDAN',
  'PANAMA',
  'PERU',
  'IRAN',
  'AZERBAIJAN',
  'BURUNDI',
  'ARMENIA',
  'FAROE ISLANDS',
  'THAILAND',
  'CYPRUS',
  'SIERRA LEONE',
  'SYRIA',
] as const;

describe('imported nationality coverage', () => {
  it.each(IMPORTED_NATIONALITIES)('translates %s away from raw provider label', (nationality) => {
    const translated = translateNationality(nationality);
    expect(translated.length).toBeGreaterThan(0);
    expect(translated).not.toBe(nationality);
  });

  it('translates common alternate spellings', () => {
    expect(translateNationality("COTE D'IVOIRE")).toBe('Fildişi Sahili');
    expect(translateNationality('IVORY COAST')).toBe('Fildişi Sahili');
    expect(translateNationality('THE GAMBIA')).toBe('Gambiya');
    expect(translateNationality('the gambia')).toBe('Gambiya');
    expect(translateNationality('KOREA, SOUTH')).toBe('Güney Kore');
    expect(translateNationality('DR CONGO')).toBe('Kongo DC');
    expect(translateNationality('TÜRKIYE')).toBe('Türkiye');
  });

  it('translates every provider-style label from the imported dataset', () => {
    const providerStyle = IMPORTED_NATIONALITIES.filter((value) =>
      /^(THE |DR )|,|'/i.test(value),
    );

    for (const nationality of providerStyle) {
      expect(translateNationality(nationality)).not.toBe(nationality);
    }
  });
});
