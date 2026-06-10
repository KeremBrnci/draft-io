import { describe, expect, it } from 'vitest';

import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import { TierClassifier } from '../../domain/services/tier-classifier.service';

describe('TierClassifier', () => {
  const classifier = new TierClassifier(DEFAULT_DRAFT_BALANCE_CONFIG);

  it('classifies S tier', () => {
    expect(classifier.classify(92)).toBe('S');
    expect(classifier.classify(99)).toBe('S');
  });

  it('classifies A-D tiers', () => {
    expect(classifier.classify(90)).toBe('A');
    expect(classifier.classify(85)).toBe('B');
    expect(classifier.classify(81)).toBe('C');
    expect(classifier.classify(76)).toBe('D');
  });

  it('detects elite tiers', () => {
    expect(classifier.isEliteTier('S')).toBe(true);
    expect(classifier.isEliteTier('A')).toBe(true);
    expect(classifier.isEliteTier('B')).toBe(false);
  });
});
