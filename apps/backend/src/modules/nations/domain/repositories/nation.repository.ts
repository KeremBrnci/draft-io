import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Nation } from '../entities/nation.entity';
import type { NationId } from '../value-objects/nation-id.vo';

export interface NationRepository {
  findById(id: NationId): Promise<Nation | null>;
  findByExternalReference(provider: ExternalProvider, externalId: string): Promise<Nation | null>;
  findAll(): Promise<readonly Nation[]>;
  save(nation: Nation): Promise<void>;
}

export const NATION_REPOSITORY = Symbol('NATION_REPOSITORY');
