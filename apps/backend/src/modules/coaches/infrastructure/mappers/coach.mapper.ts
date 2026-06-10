import type { Coach as CoachRecord } from '@prisma/client';

import { Coach } from '../../domain/entities/coach.entity';
import { CoachId } from '../../domain/value-objects/coach-id.vo';

export function toCoachDomain(record: CoachRecord): Coach {
  return Coach.reconstitute({
    id: CoachId.create(record.id),
    provider: record.provider,
    externalId: record.externalId,
    firstName: record.firstName,
    lastName: record.lastName,
    displayName: record.displayName,
    role: record.role,
    nationality: record.nationality,
    age: record.age,
    birthDate: record.birthDate,
    imageUrl: record.imageUrl,
    appointedDate: record.appointedDate,
    contractExpires: record.contractExpires,
    teamId: record.teamId,
    leagueId: record.leagueId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toCoachPersistence(coach: Coach): CoachRecord {
  return {
    id: coach.id.value,
    provider: coach.provider,
    externalId: coach.externalId,
    firstName: coach.firstName,
    lastName: coach.lastName,
    displayName: coach.displayName,
    role: coach.role,
    nationality: coach.nationality,
    age: coach.age,
    birthDate: coach.birthDate,
    imageUrl: coach.imageUrl,
    appointedDate: coach.appointedDate,
    contractExpires: coach.contractExpires,
    teamId: coach.teamId,
    leagueId: coach.leagueId,
    createdAt: coach.createdAt,
    updatedAt: coach.updatedAt,
  };
}
