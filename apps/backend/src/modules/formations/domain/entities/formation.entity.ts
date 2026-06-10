import { randomUUID } from 'node:crypto';

import { Entity } from '../../../../common/domain/entity';
import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';
import { FormationCode, type FormationCodeValue } from '../value-objects/formation-code.vo';
import { FormationSlot } from '../value-objects/formation-slot.vo';

interface SlotDefinition {
  readonly label: string;
  readonly allowedPositions: readonly PositionCode[];
}

export interface CreateFormationProps {
  readonly id?: string;
  readonly code: FormationCodeValue;
  readonly slotDefinitions: readonly SlotDefinition[];
}

export class Formation extends Entity<string> {
  private readonly _code: FormationCode;
  private readonly _slots: readonly FormationSlot[];

  private constructor(id: string, code: FormationCode, slots: readonly FormationSlot[]) {
    super(id);
    this._code = code;
    this._slots = slots;
  }

  static create(props: CreateFormationProps): Formation {
    const code = FormationCode.create(props.code);

    if (props.slotDefinitions.length !== 11) {
      throw new Error(`Formation must have exactly 11 slots, received: ${String(props.slotDefinitions.length)}`);
    }

    const slots = props.slotDefinitions.map((definition, index) =>
      FormationSlot.create({
        index: index + 1,
        label: definition.label,
        allowedPositions: definition.allowedPositions,
      }),
    );

    return new Formation(props.id ?? randomUUID(), code, slots);
  }

  static reconstitute(props: {
    readonly id: string;
    readonly code: FormationCodeValue;
    readonly slotDefinitions: readonly SlotDefinition[];
  }): Formation {
    return Formation.create({
      id: props.id,
      code: props.code,
      slotDefinitions: props.slotDefinitions,
    });
  }

  get code(): FormationCode {
    return this._code;
  }

  get slots(): readonly FormationSlot[] {
    return this._slots;
  }

  get displayName(): string {
    return this._code.value;
  }
}
