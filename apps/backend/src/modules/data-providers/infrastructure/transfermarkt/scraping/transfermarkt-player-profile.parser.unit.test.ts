import { describe, expect, it } from 'vitest';

import { parseTransfermarktPlayerProfilePositions } from './transfermarkt-player-profile.parser';

const KIMMICH_POSITIONS = `
<div class="detail-position__box">
  <div class="detail-position__inner-box">
    <dl>
      <dt class="detail-position__title">Main position:</dt>
      <dd class="detail-position__position">Centre-Back</dd>
    </dl>
  </div>
  <div class="detail-position__position">
    <dl>
      <dt class="detail-position__title">Other position:</dt>
      <dd class="detail-position__position">Central Midfield</dd>
      <dd class="detail-position__position">Defensive Midfield</dd>
    </dl>
  </div>
</div>`;

const HAALAND_POSITIONS = `
<div class="detail-position__box">
  <dt class="detail-position__title">Main position:</dt>
  <dd class="detail-position__position">Centre-Forward</dd>
</div>`;

describe('transfermarkt-player-profile.parser', () => {
  it('parses primary and secondary positions', () => {
    const result = parseTransfermarktPlayerProfilePositions(KIMMICH_POSITIONS);

    expect(result).toEqual({
      primaryPosition: 'Centre-Back',
      secondaryPositions: ['Central Midfield', 'Defensive Midfield'],
    });
  });

  it('parses primary only when no other positions exist', () => {
    const result = parseTransfermarktPlayerProfilePositions(HAALAND_POSITIONS);

    expect(result).toEqual({
      primaryPosition: 'Centre-Forward',
      secondaryPositions: [],
    });
  });
});
