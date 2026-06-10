import type { CoachBrowserItemDto } from '@draft-io/shared-types';

import type { CoachBrowserItem } from '../../application/read-models/coach-browser-item';

export function toCoachBrowserItemDto(item: CoachBrowserItem): CoachBrowserItemDto {
  return item;
}
