const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const url = 'https://www.transfermarkt.com/-/kader/verein/583/saison_id/2025/plus/1';
const html = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();

const rows = [...html.matchAll(
  /<tr[^>]*class="[^"]*odd[^"]*"[^>]*>[\s\S]*?<\/tr>|<tr[^>]*class="[^"]*even[^"]*"[^>]*>[\s\S]*?<\/tr>/gi,
)];
console.log('table rows', rows.length);

const players = [];
for (const row of rows) {
  const r = row[0];
  const idMatch = r.match(/\/profil\/spieler\/(\d+)/);
  const nameMatch = r.match(/class="hauptlink"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/);
  const posMatch = r.match(/<td class="posrela">[\s\S]*?<td>\s*([^<]+)\s*<\/td>/);
  const ageMatch = r.match(/<td class="zentriert">(\d{2})\/(\d{2})\/(\d{4})<\/td>/);
  const mvMatch = r.match(/<td class="rechts hauptlink">([^<]*)<\/td>/);
  if (!idMatch) continue;
  players.push({
    id: idMatch[1],
    name: nameMatch?.[1]?.trim(),
    pos: posMatch?.[1]?.trim(),
    dob: ageMatch ? `${ageMatch[3]}-${ageMatch[2]}-${ageMatch[1]}` : null,
    mv: mvMatch?.[1]?.trim(),
  });
}
console.log('parsed', players.length);
console.log(players.filter((p) => (p.name || '').toLowerCase().includes('vitinha')));
console.log(players.map((p) => p.name).sort());
