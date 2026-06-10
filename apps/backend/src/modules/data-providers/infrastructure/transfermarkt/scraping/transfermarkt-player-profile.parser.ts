export interface ScrapedPlayerPositions {
  readonly primaryPosition: string;
  readonly secondaryPositions: readonly string[];
}

export function parseTransfermarktPlayerProfilePositions(
  html: string,
): ScrapedPlayerPositions | null {
  const mainMatch = html.match(
    /Main position:<\/dt>\s*<dd class="detail-position__position">\s*([^<]+?)\s*<\/dd>/,
  );

  if (mainMatch === null || mainMatch[1] === undefined) {
    return null;
  }

  const otherSection = html.match(/Other position:<\/dt>([\s\S]*?)<\/dl>/);
  const secondaryPositions: string[] = [];

  const otherSectionHtml = otherSection?.[1];
  if (otherSectionHtml !== undefined) {
    for (const match of otherSectionHtml.matchAll(
      /<dd class="detail-position__position">\s*([^<]+?)\s*<\/dd>/g,
    )) {
      const position = match[1]?.trim();
      if (position !== undefined && position.length > 0) {
        secondaryPositions.push(position);
      }
    }
  }

  return {
    primaryPosition: mainMatch[1].trim(),
    secondaryPositions,
  };
}
