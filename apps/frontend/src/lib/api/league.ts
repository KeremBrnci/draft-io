import type { MatchStateDto, RoomLeagueStateDto, TeamReviewStateDto, LobbySummaryDto } from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function getTeamReview(code: string, sessionToken: string): Promise<TeamReviewStateDto> {
  return apiGet<TeamReviewStateDto>(
    `/lobbies/code/${code}/team-review?sessionToken=${encodeURIComponent(sessionToken)}`,
  );
}

export function startLeague(code: string, sessionToken: string): Promise<RoomLeagueStateDto> {
  return apiPost<RoomLeagueStateDto>(`/lobbies/code/${code}/league/start`, {
    sessionToken,
  });
}

export function getLeagueState(code: string): Promise<RoomLeagueStateDto> {
  return apiGet<RoomLeagueStateDto>(`/lobbies/code/${code}/league`);
}

export function startNextMatch(code: string): Promise<RoomLeagueStateDto> {
  return apiPost<RoomLeagueStateDto>(`/lobbies/code/${code}/league/next-match`, {});
}

export function playAgain(code: string, sessionToken: string): Promise<LobbySummaryDto> {
  return apiPost<LobbySummaryDto>(`/lobbies/code/${code}/play-again`, { sessionToken });
}

export function getMatchState(code: string, matchId: string): Promise<MatchStateDto> {
  return apiGet<MatchStateDto>(`/lobbies/code/${code}/matches/${matchId}`);
}
