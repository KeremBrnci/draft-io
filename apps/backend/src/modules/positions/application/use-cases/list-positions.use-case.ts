import { ALL_POSITION_CODES, type PositionCode } from '../../domain/value-objects/position.vo';
import type { ListPositionsQuery } from '../queries/list-positions.query';

export class ListPositionsUseCase {
  execute(query: ListPositionsQuery = {}): readonly PositionCode[] {
    if (query.includeGoalkeeperOnly === true) {
      return ['GK'];
    }

    return ALL_POSITION_CODES;
  }
}
