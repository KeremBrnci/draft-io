import { ValueObject } from '../../../../common/domain/value-object';
import { InvalidImageUrlError } from '../errors/player.errors';

interface ImageUrlProps {
  readonly value: string;
}

const MAX_LENGTH = 2048;

export class ImageUrl extends ValueObject<ImageUrlProps> {
  private constructor(props: ImageUrlProps) {
    super(props);
  }

  static create(value: string): ImageUrl {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) {
      throw new InvalidImageUrlError();
    }

    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new InvalidImageUrlError();
      }
    } catch {
      throw new InvalidImageUrlError();
    }

    return new ImageUrl({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
