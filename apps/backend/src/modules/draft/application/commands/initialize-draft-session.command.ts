import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

export interface InitializeDraftSessionCommand {
  readonly lobbyId: string;
  readonly participantIds: readonly string[];
  readonly config?: DraftBalanceConfigDto;
}
