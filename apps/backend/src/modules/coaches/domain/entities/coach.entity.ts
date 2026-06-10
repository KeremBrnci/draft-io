import { Entity } from '../../../../common/domain/entity';
import type { CoachId } from '../value-objects/coach-id.vo';

export interface CoachProps {
  readonly id: CoachId;
  readonly provider: string | null;
  readonly externalId: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly role: string;
  readonly nationality: string;
  readonly age: number | null;
  readonly birthDate: Date | null;
  readonly imageUrl: string | null;
  readonly appointedDate: Date | null;
  readonly contractExpires: Date | null;
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Coach extends Entity<CoachId> {
  private readonly _provider: string | null;
  private readonly _externalId: string | null;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _displayName: string;
  private readonly _role: string;
  private readonly _nationality: string;
  private readonly _age: number | null;
  private readonly _birthDate: Date | null;
  private readonly _imageUrl: string | null;
  private readonly _appointedDate: Date | null;
  private readonly _contractExpires: Date | null;
  private readonly _teamId: string | null;
  private readonly _leagueId: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: CoachProps) {
    super(props.id);
    this._provider = props.provider;
    this._externalId = props.externalId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._displayName = props.displayName;
    this._role = props.role;
    this._nationality = props.nationality;
    this._age = props.age;
    this._birthDate = props.birthDate;
    this._imageUrl = props.imageUrl;
    this._appointedDate = props.appointedDate;
    this._contractExpires = props.contractExpires;
    this._teamId = props.teamId;
    this._leagueId = props.leagueId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static reconstitute(props: CoachProps): Coach {
    return new Coach(props);
  }

  get provider(): string | null {
    return this._provider;
  }

  get externalId(): string | null {
    return this._externalId;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get displayName(): string {
    return this._displayName;
  }

  get role(): string {
    return this._role;
  }

  get nationality(): string {
    return this._nationality;
  }

  get age(): number | null {
    return this._age;
  }

  get birthDate(): Date | null {
    return this._birthDate;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get appointedDate(): Date | null {
    return this._appointedDate;
  }

  get contractExpires(): Date | null {
    return this._contractExpires;
  }

  get teamId(): string | null {
    return this._teamId;
  }

  get leagueId(): string | null {
    return this._leagueId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
