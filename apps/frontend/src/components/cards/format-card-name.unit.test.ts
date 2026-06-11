import { describe, expect, it } from 'vitest';

import {
  formatCardNameCompactLabel,
  formatCardNameForDisplay,
  formatCardNameLines,
  formatCardNameSingleLine,
  splitGivenNameAndSurname,
} from './format-card-name';

describe('splitGivenNameAndSurname', () => {
  it('keeps surname particles with the family name', () => {
    expect(splitGivenNameAndSurname(['Kevin', 'De', 'Bruyne'])).toEqual({
      given: 'Kevin',
      surname: 'De Bruyne',
    });
  });

  it('handles van Dijk style names', () => {
    expect(splitGivenNameAndSurname(['Virgil', 'van', 'Dijk'])).toEqual({
      given: 'Virgil',
      surname: 'van Dijk',
    });
  });
});

describe('formatCardNameLines', () => {
  it('splits first and last segments', () => {
    expect(formatCardNameLines("N'Golo Kanté")).toEqual({
      firstLine: "N'Golo",
      secondLine: 'Kanté',
    });
  });

  it('uses single token as surname line', () => {
    expect(formatCardNameLines('Haaland')).toEqual({
      firstLine: '',
      secondLine: 'Haaland',
    });
  });

  it('keeps hyphenated surnames intact', () => {
    expect(formatCardNameLines('Trent Alexander-Arnold')).toEqual({
      firstLine: 'Trent',
      secondLine: 'Alexander-Arnold',
    });
  });
});

describe('formatCardNameSingleLine', () => {
  it('trims whitespace', () => {
    expect(formatCardNameSingleLine('  Haaland  ')).toBe('Haaland');
  });
});

describe('formatCardNameForDisplay', () => {
  it('splits multi-word names', () => {
    expect(formatCardNameForDisplay('Kevin De Bruyne')).toEqual({
      mode: 'split',
      singleLine: 'Kevin De Bruyne',
      lines: { firstLine: 'Kevin', secondLine: 'De Bruyne' },
    });
  });

  it('uses single line for mononyms', () => {
    expect(formatCardNameForDisplay('Haaland')).toEqual({
      mode: 'single',
      singleLine: 'Haaland',
      lines: { firstLine: '', secondLine: 'Haaland' },
    });
  });

  it('splits long names with readable surname line', () => {
    const result = formatCardNameForDisplay('Christopher Very Long Surname Name');
    expect(result.mode).toBe('split');
    expect(result.lines.secondLine).toBe('Name');
    expect(result.lines.firstLine).toBe('C. V. L. S.');
  });

  it('keeps short given names intact on the card', () => {
    const result = formatCardNameForDisplay('Jamal Musiala');
    expect(result.lines).toEqual({ firstLine: 'Jamal', secondLine: 'Musiala' });
  });
});

describe('formatCardNameCompactLabel', () => {
  it('shows full short names', () => {
    expect(formatCardNameCompactLabel('Kevin De Bruyne')).toBe('Kevin De Bruyne');
  });

  it('abbreviates long names to initial plus surname', () => {
    expect(formatCardNameCompactLabel('Trent Alexander-Arnold')).toBe('T. Alexander-Arnold');
  });
});
