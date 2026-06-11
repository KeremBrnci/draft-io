const SOURCE_LABELS: Readonly<Record<'club' | 'nation' | 'league', string>> = {
  club: 'Kulüp',
  nation: 'Milliyet',
  league: 'Lig',
};

export function formatDraftPlayerChemistrySources(
  sources: readonly ('club' | 'nation' | 'league')[],
): string {
  if (sources.length === 0) {
    return '';
  }

  return sources.map((source) => SOURCE_LABELS[source]).join(', ');
}
