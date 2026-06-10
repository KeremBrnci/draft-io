import { randomUUID } from 'node:crypto';

import { ValueObject } from '../../../../common/domain/value-object';

interface ImportJobIdProps {
  readonly value: string;
}

export class ImportJobId extends ValueObject<ImportJobIdProps> {
  private constructor(props: ImportJobIdProps) {
    super(props);
  }

  static create(value: string): ImportJobId {
    return new ImportJobId({ value });
  }

  static generate(): ImportJobId {
    return new ImportJobId({ value: randomUUID() });
  }

  get value(): string {
    return this.props.value;
  }
}
