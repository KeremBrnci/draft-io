import { normalizeTransfermarktPortraitUrl } from '@draft-io/shared-utils';

export interface ScrapedStaffMember {
  readonly externalId: string;
  readonly slug: string;
  readonly displayName: string;
  readonly role: string;
  readonly age: number | null;
  readonly nationality: string;
  readonly imageUrl: string | null;
  readonly appointedDate: string | null;
  readonly contractExpires: string | null;
}

const STAFF_ROW_PATTERN =
  /<tr>\s*<td>\s*<table class="inline-table">([\s\S]*?)<\/table>[\s\S]*?<\/tr>/gi;

const HEAD_COACH_ROLES = new Set(['Manager', 'Head Coach', 'Head coach', 'Cheftrainer']);

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

function parseStaffDate(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();
  const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch !== null) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const dotMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (dotMatch !== null) {
    const [, day, month, year] = dotMatch;
    return `${year}-${month}-${day}`;
  }

  return null;
}

export function isHeadCoachRole(role: string): boolean {
  return HEAD_COACH_ROLES.has(role.trim());
}

export function parseTransfermarktStaffPage(html: string): readonly ScrapedStaffMember[] {
  const members: ScrapedStaffMember[] = [];

  for (const rowMatch of html.matchAll(STAFF_ROW_PATTERN)) {
    const row = rowMatch[0] ?? '';

    const profileMatch = /href="\/([^"]+)\/profil\/trainer\/(\d+)"[^>]*>([^<]*)<\/a>/.exec(row);
    if (profileMatch === null) {
      continue;
    }

    const slug = profileMatch[1];
    const externalId = profileMatch[2];
    const displayName = profileMatch[3];

    if (slug === undefined || externalId === undefined || displayName === undefined) {
      continue;
    }

    const roleMatch =
      /<table class="inline-table">[\s\S]*?<tr>\s*<td>\s*([^<]+?)\s*<\/td>\s*<\/tr>\s*<\/table>/.exec(
        row,
      );
    const ageMatch = /<\/table>\s*<\/td>\s*<td class="zentriert">\s*(\d{1,3})\s*<\/td>/.exec(row);
    const nationalityMatch =
      /class="flaggenrahmen"[^>]*title="([^"]+)"/.exec(row) ??
      /title="([^"]+)"[^>]*class="flaggenrahmen"/.exec(row);
    const imageMatch =
      /(?:data-src|src)="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"]+)"/.exec(row);
    const appointedMatch = /<td class="zentriert">\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>/.exec(row);
    const contractMatch = /<td class="zentriert">\s*(\d{2}\.\d{2}\.\d{4})\s*<\/td>/.exec(row);

    members.push({
      externalId,
      slug,
      displayName: displayName.trim(),
      role: roleMatch?.[1]?.trim() ?? 'Unknown',
      age: ageMatch?.[1] === undefined ? null : Number.parseInt(ageMatch[1], 10),
      nationality: nationalityMatch?.[1]?.trim() ?? 'Unknown',
      imageUrl: normalizeTransfermarktPortraitUrl(imageMatch?.[1] ?? null),
      appointedDate: parseStaffDate(appointedMatch?.[1] ?? null),
      contractExpires: parseStaffDate(contractMatch?.[1] ?? null),
    });
  }

  return members;
}

export function findHeadCoachFromStaffPage(html: string): ScrapedStaffMember | null {
  const members = parseTransfermarktStaffPage(html);
  return members.find((member) => isHeadCoachRole(member.role)) ?? null;
}

export function splitCoachName(displayName: string): { firstName: string; lastName: string } {
  return splitName(displayName);
}
