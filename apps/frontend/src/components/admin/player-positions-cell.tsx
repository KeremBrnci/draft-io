import type { PlayerPositionAssignmentDto } from '@draft-io/shared-types';
import {
  deduplicatePlayerPositionAssignmentsForDisplay,
  translatePositionCode,
} from '@draft-io/shared-utils';

export function PlayerPositionsCell({
  positions,
}: {
  readonly positions: readonly PlayerPositionAssignmentDto[];
}): React.ReactElement {
  const visible = deduplicatePlayerPositionAssignmentsForDisplay(positions);

  if (visible.length === 0) {
    return <span>—</span>;
  }

  return (
    <span className="admin-position-tags">
      {visible.map((assignment) => {
        const short = translatePositionCode(assignment.positionCode);
        const long = translatePositionCode(assignment.positionCode, { long: true });

        return (
          <span
            key={`${assignment.positionCode}-${assignment.isPrimary ? 'primary' : 'secondary'}`}
            className={
              assignment.isPrimary
                ? 'admin-position-tag admin-position-tag--primary'
                : 'admin-position-tag'
            }
            title={long}
          >
            {short}
          </span>
        );
      })}
    </span>
  );
}
