import { Entity } from '../../../../common/domain/entity';
import type { Position } from '../../../positions/domain/value-objects/position.vo';
import type { PlayerId } from '../value-objects/player-id.vo';
import type { PlayerPositionId } from '../value-objects/player-position-id.vo';

export interface CreatePlayerPositionProps {
  readonly id: PlayerPositionId;
  readonly playerId: PlayerId;
  readonly position: Position;
  readonly isPrimary: boolean;
}

export interface PlayerPositionProps extends CreatePlayerPositionProps {
  readonly createdAt: Date;
}

export class PlayerPosition extends Entity<PlayerPositionId> {
  private readonly _playerId: PlayerId;
  private readonly _position: Position;
  private readonly _isPrimary: boolean;
  private readonly _createdAt: Date;

  private constructor(props: PlayerPositionProps) {
    super(props.id);
    this._playerId = props.playerId;
    this._position = props.position;
    this._isPrimary = props.isPrimary;
    this._createdAt = props.createdAt;
  }

  static create(props: CreatePlayerPositionProps): PlayerPosition {
    return new PlayerPosition({
      ...props,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: PlayerPositionProps): PlayerPosition {
    return new PlayerPosition(props);
  }

  get playerId(): PlayerId {
    return this._playerId;
  }

  get position(): Position {
    return this._position;
  }

  get positionCode(): Position['value'] {
    return this._position.value;
  }

  get isPrimary(): boolean {
    return this._isPrimary;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
