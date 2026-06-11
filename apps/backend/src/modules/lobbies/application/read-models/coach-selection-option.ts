import type { CoachBrowserItem } from '../../../coaches/application/read-models/coach-browser-item';

export interface CoachSelectionOption extends CoachBrowserItem {
  readonly projectedTeamChemistry: number;
  readonly chemistryBonus: number;
}
