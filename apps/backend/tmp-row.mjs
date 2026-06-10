import { writeFileSync } from 'node:fs';

const UA = 'Mozilla/5.0';
const html = await (
  await fetch('https://www.transfermarkt.com/-/kader/verein/583/saison_id/2025/plus/1', {
    headers: { 'User-Agent': UA },
  })
).text();

const i = html.indexOf('profil/spieler/487469');
writeFileSync('/tmp/vitinha-row.html', html.slice(i - 800, i + 1500));
console.log('written', i);
