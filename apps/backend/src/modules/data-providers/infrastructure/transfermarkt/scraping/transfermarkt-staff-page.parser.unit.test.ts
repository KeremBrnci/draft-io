import { describe, expect, it } from 'vitest';

import {
  findHeadCoachFromStaffPage,
  isHeadCoachRole,
  parseTransfermarktStaffPage,
} from './transfermarkt-staff-page.parser';

const LUIS_ENRIQUE_ROW = `<tr>
    <td>
        <table class="inline-table">
            <tr>
                <td rowspan="2">
                    <img src="https://img.a.transfermarkt.technology/portrait/small/6499-1746692948.jpg?lm=1" title="Luis Enrique" alt="Luis Enrique" class="bilderrahmen" />
                </td>
                <td class="hauptlink">
                    <a title="Luis Enrique" id="6499" href="/luis-enrique/profil/trainer/6499">Luis Enrique</a>
                </td>
            </tr>
            <tr>
                <td>Manager</td>
            </tr>
        </table>
    </td>
    <td class="zentriert">56</td>
    <td class="zentriert">
        <img src="https://tmssl.akamaized.net//images/flagge/verysmall/157.png" title="Spain" alt="Spain" class="flaggenrahmen" />
    </td>
    <td class="zentriert">05/07/2023</td>
    <td class="zentriert">30.06.2027</td>
    <td class="zentriert"><a title="Spain" href="/spanien/startseite/verein/3375"><img class="flaggenrahmen" /></a></td>
</tr>`;

describe('transfermarkt-staff-page.parser', () => {
  it('detects head coach roles', () => {
    expect(isHeadCoachRole('Manager')).toBe(true);
    expect(isHeadCoachRole('Assistant Manager')).toBe(false);
  });

  it('parses staff rows', () => {
    const members = parseTransfermarktStaffPage(LUIS_ENRIQUE_ROW);

    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({
      externalId: '6499',
      displayName: 'Luis Enrique',
      role: 'Manager',
      nationality: 'Spain',
      age: 56,
      appointedDate: '2023-07-05',
      contractExpires: '2027-06-30',
    });
    expect(members[0]?.imageUrl).toContain('6499');
  });

  it('finds head coach from staff page html', () => {
    const coach = findHeadCoachFromStaffPage(LUIS_ENRIQUE_ROW);
    expect(coach?.displayName).toBe('Luis Enrique');
  });
});
