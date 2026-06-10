import { NATIONALITY_KEY_ALIASES } from './tr-nationalities';

const TM_CDN = 'https://tmssl.akamaized.net';
const TM_PORTRAIT_CDN = 'https://img.a.transfermarkt.technology';

const TM_PORTRAIT_PATH_PATTERN =
  /img\.a\.transfermarkt\.technology\/portrait\/(?:big|medium|small|header)\/(\d+)-(\d+)\.(jpg|png)(?:\?lm=1)?/i;

/** Transfermarkt nationality label → country id used in flag image URLs. */
const NATIONALITY_TM_COUNTRY_ID: Readonly<Record<string, string>> = {
  ALBANIA: '3',
  ALGERIA: '4',
  ANGOLA: '6',
  ARGENTINA: '9',
  ARMENIA: '8',
  AUSTRALIA: '12',
  AUSTRIA: '127',
  AZERBAIJAN: '13',
  BELGIUM: '19',
  BENIN: '18',
  'BOSNIA-HERZEGOVINA': '24',
  BRAZIL: '26',
  BULGARIA: '28',
  'BURKINA FASO': '29',
  BURUNDI: '27',
  CAMEROON: '31',
  CANADA: '80',
  'CAPE VERDE': '32',
  CHAD: '209',
  CHILE: '33',
  COLOMBIA: '35',
  COMOROS: '34',
  CONGO: '36',
  'COSTA RICA': '41',
  'COTE D IVOIRE': '38',
  CROATIA: '37',
  CURACAO: '533',
  CYPRUS: '42',
  'CZECH REPUBLIC': '172',
  DENMARK: '39',
  'DOMINICAN REPUBLIC': '43',
  'DR CONGO': '193',
  ECUADOR: '44',
  EGYPT: '45',
  ENGLAND: '189',
  'EQUATORIAL GUINEA': '46',
  ESTONIA: '47',
  'FAROE ISLANDS': '65',
  FINLAND: '49',
  FRANCE: '50',
  'FRENCH GUIANA': '48',
  GABON: '51',
  GAMBIA: '52',
  GEORGIA: '53',
  GERMANY: '40',
  GHANA: '54',
  GREECE: '56',
  GUADELOUPE: '58',
  GUINEA: '59',
  'GUINEA-BISSAU': '60',
  HAITI: '62',
  HONDURAS: '64',
  HUNGARY: '178',
  ICELAND: '73',
  INDONESIA: '68',
  IRELAND: '72',
  ISRAEL: '74',
  ITALY: '75',
  JAMAICA: '76',
  JAPAN: '77',
  JORDAN: '78',
  KOSOVO: '244',
  'KOREA SOUTH': '87',
  LATVIA: '92',
  LIBYA: '97',
  LITHUANIA: '96',
  LUXEMBOURG: '98',
  MADAGASCAR: '103',
  MALAYSIA: '105',
  MALI: '108',
  MAURITANIA: '109',
  MEXICO: '110',
  MOLDOVA: '112',
  MONTENEGRO: '216',
  MOROCCO: '107',
  MOZAMBIQUE: '111',
  NETHERLANDS: '122',
  'NEW ZEALAND': '120',
  NIGER: '119',
  NIGERIA: '124',
  'NORTH MACEDONIA': '208',
  'NORTHERN IRELAND': '192',
  NORWAY: '125',
  PANAMA: '129',
  PARAGUAY: '132',
  PERU: '133',
  POLAND: '135',
  PORTUGAL: '136',
  'PUERTO RICO': '134',
  ROMANIA: '140',
  RUSSIA: '141',
  'SAUDI ARABIA': '151',
  SCOTLAND: '190',
  SENEGAL: '152',
  SERBIA: '215',
  'SIERRA LEONE': '156',
  SLOVAKIA: '154',
  SLOVENIA: '155',
  'SOUTH AFRICA': '159',
  SPAIN: '157',
  SURINAME: '153',
  SWEDEN: '147',
  SWITZERLAND: '148',
  SYRIA: '160',
  TANZANIA: '167',
  THAILAND: '166',
  TOGO: '168',
  'TRINIDAD AND TOBAGO': '169',
  TUNISIA: '173',
  TURKEY: '174',
  TURKIYE: '174',
  TÜRKIYE: '174',
  UKRAINE: '177',
  'UNITED STATES': '184',
  URUGUAY: '179',
  UZBEKISTAN: '180',
  VENEZUELA: '182',
  WALES: '191',
  ZAMBIA: '185',
  ZIMBABWE: '187',
  'CENTRAL AFRICAN REPUBLIC': '30',
  IRAN: '71',
};

function normalizeNationalityKey(value: string): string {
  const withoutDiacritics = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  return withoutDiacritics
    .trim()
    .replace(/[''`´]/g, ' ')
    .replace(/^THE\s+/i, '')
    .replace(/\s*,\s*/g, ' ')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveNationalityKey(value: string): string {
  const normalized = normalizeNationalityKey(value);
  return NATIONALITY_KEY_ALIASES[normalized] ?? normalized;
}

export function resolveTransfermarktCountryId(nationality: string | null | undefined): string | null {
  if (nationality === null || nationality === undefined || nationality.trim().length === 0) {
    return null;
  }

  const key = resolveNationalityKey(nationality);
  return NATIONALITY_TM_COUNTRY_ID[key] ?? null;
}

/** Builds a header portrait URL when the version hash from Transfermarkt is known. */
export function buildTransfermarktPlayerPortraitUrl(
  externalId: string | null | undefined,
  version?: string | null,
  extension: 'jpg' | 'png' = 'jpg',
): string | null {
  if (externalId === null || externalId === undefined || externalId.trim().length === 0) {
    return null;
  }

  if (version === null || version === undefined || version.trim().length === 0) {
    return null;
  }

  return `${TM_PORTRAIT_CDN}/portrait/header/${externalId.trim()}-${version.trim()}.${extension}?lm=1`;
}

/** Normalizes any Transfermarkt portrait URL to the header size used in admin UI. */
export function normalizeTransfermarktPortraitUrl(
  imageUrl: string | null | undefined,
): string | null {
  if (imageUrl === null || imageUrl === undefined || imageUrl.trim().length === 0) {
    return null;
  }

  const trimmed = imageUrl.trim().startsWith('http')
    ? imageUrl.trim()
    : `https://${imageUrl.trim()}`;

  const match = trimmed.match(TM_PORTRAIT_PATH_PATTERN);
  if (match === null) {
    return trimmed;
  }

  const [, externalId, version, extension] = match;
  return buildTransfermarktPlayerPortraitUrl(externalId, version, extension as 'jpg' | 'png');
}

/** Extracts player portrait URLs keyed by Transfermarkt player id from squad HTML. */
export function extractTransfermarktPortraitUrlsFromHtml(html: string): ReadonlyMap<string, string> {
  const portraits = new Map<string, string>();
  const pattern =
    /(?:data-src|src)="https?:\/\/img\.a\.transfermarkt\.technology\/portrait\/(?:big|medium|small|header)\/(\d+)-(\d+)\.(jpg|png)\?lm=1"/gi;

  for (const match of html.matchAll(pattern)) {
    const externalId = match[1];
    const version = match[2];
    const extension = match[3] as 'jpg' | 'png';
    const headerUrl = buildTransfermarktPlayerPortraitUrl(externalId, version, extension);

    if (headerUrl !== null) {
      portraits.set(externalId, headerUrl);
    }
  }

  return portraits;
}

export function buildTransfermarktTeamLogoUrl(externalId: string | null | undefined): string | null {
  if (externalId === null || externalId === undefined || externalId.trim().length === 0) {
    return null;
  }

  return `${TM_CDN}//images/wappen/verysmall/${externalId.trim()}.png`;
}

export function buildTransfermarktLeagueLogoUrl(externalId: string | null | undefined): string | null {
  if (externalId === null || externalId === undefined || externalId.trim().length === 0) {
    return null;
  }

  return `${TM_CDN}//images/logo/normal/${externalId.trim().toLowerCase()}.png`;
}

export function buildTransfermarktNationalityFlagUrl(nationality: string | null | undefined): string | null {
  const countryId = resolveTransfermarktCountryId(nationality);

  if (countryId === null) {
    return null;
  }

  return `${TM_CDN}//images/flagge/verysmall/${countryId}.png`;
}

export function resolveTransfermarktPlayerImageUrl(
  storedImageUrl: string | null | undefined,
  _externalId: string | null | undefined,
): string | null {
  return normalizeTransfermarktPortraitUrl(storedImageUrl);
}

export function resolveTransfermarktTeamLogoUrl(
  storedLogoUrl: string | null | undefined,
  externalId: string | null | undefined,
): string | null {
  if (storedLogoUrl !== null && storedLogoUrl !== undefined && storedLogoUrl.trim().length > 0) {
    return storedLogoUrl;
  }

  return buildTransfermarktTeamLogoUrl(externalId);
}

export function resolveTransfermarktLeagueLogoUrl(
  storedLogoUrl: string | null | undefined,
  externalId: string | null | undefined,
): string | null {
  if (storedLogoUrl !== null && storedLogoUrl !== undefined && storedLogoUrl.trim().length > 0) {
    return storedLogoUrl;
  }

  return buildTransfermarktLeagueLogoUrl(externalId);
}
