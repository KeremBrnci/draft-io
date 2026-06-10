export { assertNever } from './assert-never.js';
export { clamp } from './clamp.js';
export { isNonEmptyString } from './is-non-empty-string.js';
export { slugify } from './slugify.js';
export {
  findUntranslatedNationalities,
  translateLeagueName,
  translateNationality,
  translateCoachRole,
  translatePositionCode,
  translateTeamName,
} from './tr-football-display.js';
export {
  canonicalizePositionCode,
  collapseEquivalentPositionCodes,
  deduplicatePlayerPositionAssignmentsForDisplay,
  expandPositionFilterCodes,
  formatPlayerPositionLabels,
  formatPositionFilterOption,
  PLAYER_POSITION_FILTER_OPTIONS,
  type PlayerPositionAssignmentLike,
  type PlayerPositionFilterOption,
} from './player-position-display.js';
export {
  buildTransfermarktLeagueLogoUrl,
  buildTransfermarktNationalityFlagUrl,
  buildTransfermarktPlayerPortraitUrl,
  buildTransfermarktTeamLogoUrl,
  extractTransfermarktPortraitUrlsFromHtml,
  normalizeTransfermarktPortraitUrl,
  resolveTransfermarktCountryId,
  resolveTransfermarktLeagueLogoUrl,
  resolveTransfermarktPlayerImageUrl,
  resolveTransfermarktTeamLogoUrl,
} from './transfermarkt-media.js';
