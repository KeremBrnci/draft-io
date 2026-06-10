import { Entity } from '../../../../common/domain/entity';
import type { OverallProfileTag } from '../enums/overall-profile-tag.enum';
import type { OverallComponentScores } from '../models/overall-component-scores';
import { type OverallCalculationId } from '../value-objects/overall-calculation-id.vo';

export interface OverallCalculationProps {
  readonly id: OverallCalculationId;
  readonly playerId: string;
  readonly algorithmVersionId: string;
  readonly components: OverallComponentScores;
  readonly rawScore: number;
  readonly finalOverall: number;
  readonly profileTag: OverallProfileTag | null;
  readonly appliedFloor: number | null;
  readonly appliedCeiling: number | null;
  readonly createdAt: Date;
}

export class OverallCalculation extends Entity<OverallCalculationId> {
  private readonly _playerId: string;
  private readonly _algorithmVersionId: string;
  private readonly _components: OverallComponentScores;
  private readonly _rawScore: number;
  private readonly _finalOverall: number;
  private readonly _profileTag: OverallProfileTag | null;
  private readonly _appliedFloor: number | null;
  private readonly _appliedCeiling: number | null;
  private readonly _createdAt: Date;

  private constructor(props: OverallCalculationProps) {
    super(props.id);
    this._playerId = props.playerId;
    this._algorithmVersionId = props.algorithmVersionId;
    this._components = props.components;
    this._rawScore = props.rawScore;
    this._finalOverall = props.finalOverall;
    this._profileTag = props.profileTag;
    this._appliedFloor = props.appliedFloor;
    this._appliedCeiling = props.appliedCeiling;
    this._createdAt = props.createdAt;
  }

  static create(props: Omit<OverallCalculationProps, 'createdAt'>): OverallCalculation {
    return new OverallCalculation({ ...props, createdAt: new Date() });
  }

  static reconstitute(props: OverallCalculationProps): OverallCalculation {
    return new OverallCalculation(props);
  }

  get playerId(): string {
    return this._playerId;
  }

  get algorithmVersionId(): string {
    return this._algorithmVersionId;
  }

  get components(): OverallComponentScores {
    return this._components;
  }

  get rawScore(): number {
    return this._rawScore;
  }

  get finalOverall(): number {
    return this._finalOverall;
  }

  get profileTag(): OverallProfileTag | null {
    return this._profileTag;
  }

  get appliedFloor(): number | null {
    return this._appliedFloor;
  }

  get appliedCeiling(): number | null {
    return this._appliedCeiling;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
