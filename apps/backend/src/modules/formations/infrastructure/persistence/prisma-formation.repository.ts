import { Injectable } from '@nestjs/common';
import type { Formation as PrismaFormation } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';
import { getAllFormations } from '../../domain/constants/formation-templates';
import { Formation } from '../../domain/entities/formation.entity';
import type { FormationRepository } from '../../domain/repositories/formation.repository';
import type { FormationCode } from '../../domain/value-objects/formation-code.vo';
import type { FormationCodeValue } from '../../domain/value-objects/formation-code.vo';

interface PersistedSlot {
  readonly label: string;
  readonly allowedPositions: readonly string[];
}

@Injectable()
export class PrismaFormationRepository implements FormationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<readonly Formation[]> {
    const records = await this.prisma.formation.findMany({ orderBy: { code: 'asc' } });
    return records.map(toFormationDomain);
  }

  async findById(id: string): Promise<Formation | null> {
    const record = await this.prisma.formation.findUnique({ where: { id } });
    return record === null ? null : toFormationDomain(record);
  }

  async findByCode(code: FormationCode): Promise<Formation | null> {
    const record = await this.prisma.formation.findUnique({ where: { code: code.value } });
    return record === null ? null : toFormationDomain(record);
  }
}

export function toFormationDomain(record: PrismaFormation): Formation {
  const slots = record.slots as unknown as readonly PersistedSlot[];
  return Formation.reconstitute({
    id: record.id,
    code: record.code as FormationCodeValue,
    slotDefinitions: slots.map((slot) => ({
      label: slot.label,
      allowedPositions: slot.allowedPositions as PositionCode[],
    })),
  });
}

export function toFormationPersistence(formation: Formation): {
  readonly id: string;
  readonly code: string;
  readonly slots: readonly PersistedSlot[];
} {
  return {
    id: formation.id,
    code: formation.code.value,
    slots: formation.slots.map((slot) => ({
      label: slot.label,
      allowedPositions: [...slot.allowedPositions],
    })),
  };
}

/** Seeds formations from domain templates when the table is empty. */
export async function seedFormationsIfEmpty(prisma: PrismaService): Promise<void> {
  const count = await prisma.formation.count();
  if (count > 0) {
    return;
  }

  const formations = getAllFormations();
  for (const formation of formations) {
    const data = toFormationPersistence(formation);
    await prisma.formation.create({
      data: {
        id: data.id,
        code: data.code,
        slots: data.slots as object,
      },
    });
  }
}
