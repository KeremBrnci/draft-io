import { normalizeTransfermarktPortraitUrl } from '@draft-io/shared-utils';

import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import { normalizeExternalPositionCode } from '../../../../positions/application/normalize-external-position-code';
import type { ExternalPlayerRecord } from '../../../domain/models/external-player-record';

export interface ScrapedSquadPlayer {
  readonly externalId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly position: string;
  readonly dateOfBirth: string | null;
  readonly age: number | null;
  readonly nationality: string;
  readonly marketValue: number | null;
  readonly imageUrl: string | null;
}

const SQUAD_ROW_PATTERN =
  /<tr class="(?:odd|even) theme\d+">([\s\S]*?<td class="rechts hauptlink">[\s\S]*?<\/td>)<\/tr>/gi;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    const single = parts[0] ?? fullName;
    return { firstName: single, lastName: single };
  }

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export function parseTransfermarktMarketValue(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  const normalized = raw.replace(/\s/g, '').replace(/€/g, '').toLowerCase();

  if (normalized.length === 0 || normalized === '-' || normalized === '?') {
    return null;
  }

  const match = normalized.match(/^([\d.,]+)(m|k|bn|th)?$/i);
  if (match === null) {
    return null;
  }

  const amount = Number.parseFloat((match[1] ?? '').replace(',', '.'));
  if (Number.isNaN(amount)) {
    return null;
  }

  const unit = match[2]?.toLowerCase();
  if (unit === 'm') {
    return Math.round(amount * 1_000_000);
  }

  if (unit === 'k' || unit === 'th') {
    return Math.round(amount * 1_000);
  }

  if (unit === 'bn') {
    return Math.round(amount * 1_000_000_000);
  }

  return Math.round(amount);
}

function parseBirthDate(raw: string | null | undefined): { dateOfBirth: string | null; age: number | null } {
  if (raw === null || raw === undefined) {
    return { dateOfBirth: null, age: null };
  }

  const match = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s*\((\d{1,2})\))?/);
  if (match === null) {
    return { dateOfBirth: null, age: null };
  }

  const [, day, month, year, ageText] = match;
  return {
    dateOfBirth: `${year}-${month}-${day}`,
    age: ageText === undefined ? null : Number.parseInt(ageText, 10),
  };
}

export function parseTransfermarktSquadPage(html: string): readonly ScrapedSquadPlayer[] {
  const players: ScrapedSquadPlayer[] = [];

  for (const rowMatch of html.matchAll(SQUAD_ROW_PATTERN)) {
    const row = rowMatch[1] ?? '';

    const profileMatch = row.match(
      /<a href="\/([^"]+)\/profil\/spieler\/(\d+)"[^>]*>\s*([^<]+?)\s*<\/a>/,
    );
    if (profileMatch === null) {
      continue;
    }

    const slug = profileMatch[1];
    const externalId = profileMatch[2];
    const displayName = profileMatch[3];

    if (slug === undefined || externalId === undefined || displayName === undefined) {
      continue;
    }
    const positionMatch =
      row.match(/<td class="hauptlink">[\s\S]*?<\/tr>\s*<tr>\s*<td>\s*([^<]+?)\s*<\/td>/) ??
      row.match(/class="posrela">[\s\S]*?<tr>\s*<td>\s*([^<]+?)\s*<\/td>/);
    const birthMatch = row.match(
      /<td class="zentriert">\s*(\d{2}\/\d{2}\/\d{4}(?:\s*\(\d{1,2}\))?)\s*<\/td>/,
    );
    const nationalityMatch =
      row.match(/class="flaggenrahmen"[^>]*title="([^"]+)"/) ??
      row.match(/title="([^"]+)"[^>]*class="flaggenrahmen"/);
    const imageMatch = row.match(
      /data-src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/,
    );
    const marketValueMatch = row.match(
      /<td class="rechts hauptlink">[\s\S]*?<a[^>]*>([^<]*)<\/a>/,
    );

    const birth = parseBirthDate(birthMatch?.[1] ?? null);

    players.push({
      externalId,
      slug,
      displayName: displayName.trim(),
      position: positionMatch?.[1]?.trim() ?? 'Unknown',
      dateOfBirth: birth.dateOfBirth,
      age: birth.age,
      nationality: nationalityMatch?.[1]?.trim() ?? 'Unknown',
      marketValue: parseTransfermarktMarketValue(marketValueMatch?.[1] ?? null),
      imageUrl: normalizeTransfermarktPortraitUrl(imageMatch?.[1] ?? null),
    });
  }

  return players;
}

export function mapScrapedSquadPlayerToExternalRecord(
  player: ScrapedSquadPlayer,
  clubExternalId: string,
  leagueExternalId: string | null,
): ExternalPlayerRecord {
  const { firstName, lastName } = splitName(player.displayName);

  return {
    provider: ExternalProvider.TRANSFERMARKT,
    slug: slugify(player.slug),
    externalId: player.externalId,
    firstName,
    lastName,
    displayName: player.displayName,
    nationality: player.nationality,
    teamExternalId: clubExternalId,
    leagueExternalId,
    primaryPosition: normalizeExternalPositionCode(player.position) ?? 'CM',
    secondaryPositions: [],
    age: player.age,
    dateOfBirth: player.dateOfBirth,
    apiOverallHint: null,
    marketValue: player.marketValue,
    marketValueCurrency: player.marketValue === null ? null : 'EUR',
    imageUrl: player.imageUrl,
    status: 'ACTIVE',
  };
}
