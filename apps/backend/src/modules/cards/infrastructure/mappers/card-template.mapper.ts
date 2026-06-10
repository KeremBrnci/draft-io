import type { CardTemplate as PrismaCardTemplate } from '@prisma/client';

import { CardTemplate } from '../../domain/entities/card-template.entity';
import { ReferenceId } from '../../domain/value-objects/reference-id.vo';

export function toCardTemplateDomain(record: PrismaCardTemplate): CardTemplate {
  return CardTemplate.reconstitute({
    id: ReferenceId.create(record.id),
    cardTypeId: ReferenceId.create(record.cardTypeId),
    name: record.name,
    backgroundImage: record.backgroundImage,
    borderImage: record.borderImage,
    animationKey: record.animationKey,
    primaryColor: record.primaryColor,
    secondaryColor: record.secondaryColor,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toCardTemplatePersistence(template: CardTemplate) {
  return {
    id: template.id.value,
    cardTypeId: template.cardTypeId.value,
    name: template.name,
    backgroundImage: template.backgroundImage,
    borderImage: template.borderImage,
    animationKey: template.animationKey,
    primaryColor: template.primaryColor,
    secondaryColor: template.secondaryColor,
    isActive: template.isActive,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}
