import { describe, expect, it } from 'vitest';

import { InvalidImageUrlError } from '../errors/player.errors';

import { ImageUrl } from './image-url.vo';

describe('ImageUrl', () => {
  it('accepts https URLs', () => {
    expect(ImageUrl.create('https://example.com/a.png').value).toContain('https://');
  });

  it('rejects invalid URLs', () => {
    expect(() => ImageUrl.create('not-a-url')).toThrow(InvalidImageUrlError);
  });
});
