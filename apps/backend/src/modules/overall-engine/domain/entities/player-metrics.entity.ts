import { Entity } from '../../../../common/domain/entity';
import type { OverallProfileTag } from '../enums/overall-profile-tag.enum';
import type { OverallComponentScores } from '../models/overall-component-scores';
import { type PlayerMetricsId } from '../value-objects/player-metrics-id.vo';

export interface PlayerMetricsProps {
  readonly id: PlayerMetricsId;
  readonly playerId: string;
  readonly algorithmVersionId: string;
  readonly components: OverallComponentScores;
  readonly profileTag: OverallProfileTag | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class PlayerMetrics extends Entity<PlayerMetricsId> {
  private readonly _playerId: string;
  private readonly _algorithmVersionId: string;
  private _components: OverallComponentScores;
  private _profileTag: OverallProfileTag | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PlayerMetricsProps) {
    super(props.id);
    this._playerId = props.playerId;
    this._algorithmVersionId = props.algorithmVersionId;
    this._components = props.components;
    this._profileTag = props.profileTag;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: Omit<PlayerMetricsProps, 'createdAt' | 'updatedAt'>): PlayerMetrics {
    const now = new Date();
    return new PlayerMetrics({ ...props, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: PlayerMetricsProps): PlayerMetrics {
    return new PlayerMetrics(props);
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

  get profileTag(): OverallProfileTag | null {
    return this._profileTag;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateComponents(components: OverallComponentScores): void {
    this._components = components;
    this._updatedAt = new Date();
  }

  updateManualInputs(input: {
    readonly careerScore?: number;
    readonly legacyScore?: number;
    readonly profileTag?: OverallProfileTag | null;
  }): void {
    this._components = {
      ...this._components,
      ...(input.careerScore !== undefined ? { careerScore: input.careerScore } : {}),
      ...(input.legacyScore !== undefined ? { legacyScore: input.legacyScore } : {}),
    };

    if (input.profileTag !== undefined) {
      this._profileTag = input.profileTag;
    }

    this._updatedAt = new Date();
  }
}
