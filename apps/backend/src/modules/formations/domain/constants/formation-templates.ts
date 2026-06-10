import type { PositionCode } from '../../../positions/domain/value-objects/position.vo';
import { Formation } from '../entities/formation.entity';
import { ALL_FORMATION_CODES, type FormationCodeValue } from '../value-objects/formation-code.vo';

interface SlotDefinition {
  readonly label: string;
  readonly allowedPositions: readonly PositionCode[];
}

type FormationTemplate = readonly SlotDefinition[];

const FORMATION_442: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'LM', allowedPositions: ['LM', 'LW'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'RM', allowedPositions: ['RM', 'RW'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const FORMATION_433: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CAM'] },
  { label: 'LW', allowedPositions: ['LW', 'LM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'RW', allowedPositions: ['RW', 'RM'] },
];

const FORMATION_4231: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'CAM', allowedPositions: ['CAM', 'CM'] },
  { label: 'LW', allowedPositions: ['LW', 'LM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'RW', allowedPositions: ['RW', 'RM'] },
];

const FORMATION_352: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'LWB', allowedPositions: ['LWB', 'LB', 'LM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CAM'] },
  { label: 'RWB', allowedPositions: ['RWB', 'RB', 'RM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const FORMATION_532: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LWB', allowedPositions: ['LWB', 'LB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RWB', allowedPositions: ['RWB', 'RB'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const FORMATION_343: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'LM', allowedPositions: ['LM', 'LWB'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'RM', allowedPositions: ['RM', 'RWB'] },
  { label: 'LW', allowedPositions: ['LW', 'LM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'RW', allowedPositions: ['RW', 'RM'] },
];

const FORMATION_451: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'LM', allowedPositions: ['LM', 'LW'] },
  { label: 'CM', allowedPositions: ['CM', 'CAM'] },
  { label: 'RM', allowedPositions: ['RM', 'RW'] },
  { label: 'CAM', allowedPositions: ['CAM', 'CM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const FORMATION_4222: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'CAM', allowedPositions: ['CAM', 'CM'] },
  { label: 'CAM', allowedPositions: ['CAM', 'CM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const FORMATION_41212: FormationTemplate = [
  { label: 'GK', allowedPositions: ['GK'] },
  { label: 'LB', allowedPositions: ['LB', 'LWB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'CB', allowedPositions: ['CB'] },
  { label: 'RB', allowedPositions: ['RB', 'RWB'] },
  { label: 'CDM', allowedPositions: ['CDM', 'CM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CM', allowedPositions: ['CM', 'CDM'] },
  { label: 'CAM', allowedPositions: ['CAM', 'CM'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
  { label: 'ST', allowedPositions: ['ST', 'CF'] },
];

const TEMPLATES: Record<FormationCodeValue, FormationTemplate> = {
  '4-4-2': FORMATION_442,
  '4-3-3': FORMATION_433,
  '4-2-3-1': FORMATION_4231,
  '3-5-2': FORMATION_352,
  '5-3-2': FORMATION_532,
  '3-4-3': FORMATION_343,
  '4-5-1': FORMATION_451,
  '4-2-2-2': FORMATION_4222,
  '4-1-2-1-2': FORMATION_41212,
};

export function buildFormationFromTemplate(code: FormationCodeValue): Formation {
  const template = TEMPLATES[code];
  return Formation.create({ code, slotDefinitions: template });
}

export function getAllFormations(): readonly Formation[] {
  return ALL_FORMATION_CODES.map((code) => buildFormationFromTemplate(code));
}
