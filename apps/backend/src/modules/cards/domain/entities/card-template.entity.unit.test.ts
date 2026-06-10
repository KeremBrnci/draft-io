import { describe, expect, it } from 'vitest';

import { buildTestCardTemplate } from '../../testing/card-test.factory';
import { ReferenceId } from '../value-objects/reference-id.vo';

describe('CardTemplate', () => {
  it('holds presentation keys without rendering logic', () => {
    const template = buildTestCardTemplate({
      name: 'Icon White Template',
      primaryColor: '#FFFFFF',
      animationKey: 'icon-shimmer',
    });

    expect(template.name).toBe('Icon White Template');
    expect(template.animationKey).toBe('icon-shimmer');
  });

  it('links to a card type for template selection', () => {
    const typeId = ReferenceId.create('550e8400-e29b-41d4-a716-446655440210');
    const template = buildTestCardTemplate({ cardTypeId: typeId });

    expect(template.cardTypeId.value).toBe(typeId.value);
  });
});
