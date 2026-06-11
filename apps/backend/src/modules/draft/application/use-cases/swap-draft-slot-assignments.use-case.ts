import {
  DraftParticipantNotFoundError,
  DraftSessionNotFoundError,
  InvalidDraftPickError,
} from '../../domain/errors/draft.errors';
import { swapSlotAssignments } from '../../domain/models/participant-draft-state';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';

export interface SwapDraftSlotAssignmentsCommand {
  readonly lobbyId: string;
  readonly participantId: string;
  readonly fromSlotIndex: number;
  readonly toSlotIndex: number;
  readonly toSlotMetadata: { readonly positionCode: string; readonly slotLabel: string };
  readonly fromSlotMetadata: { readonly positionCode: string; readonly slotLabel: string };
}

export class SwapDraftSlotAssignmentsUseCase {
  constructor(private readonly draftSessionRepository: DraftSessionRepository) {}

  async execute(command: SwapDraftSlotAssignmentsCommand): Promise<DraftSession> {
    const session = await this.draftSessionRepository.findByLobbyId(command.lobbyId);
    if (session === null) {
      throw new DraftSessionNotFoundError(command.lobbyId);
    }

    const participantIndex = session.participants.findIndex(
      (entry) => entry.participantId === command.participantId,
    );
    if (participantIndex < 0) {
      throw new DraftParticipantNotFoundError(command.participantId);
    }

    const participant = session.participants[participantIndex];
    if (participant === undefined) {
      throw new DraftParticipantNotFoundError(command.participantId);
    }

    const fromAssignment = participant.slotAssignments.find(
      (assignment) => assignment.slotIndex === command.fromSlotIndex,
    );
    const toAssignment = participant.slotAssignments.find(
      (assignment) => assignment.slotIndex === command.toSlotIndex,
    );

    if (fromAssignment === undefined || toAssignment === undefined) {
      throw new InvalidDraftPickError('Both formation slots must be filled to swap players');
    }

    if (command.fromSlotIndex === command.toSlotIndex) {
      throw new InvalidDraftPickError('Cannot swap a slot with itself');
    }

    const updatedParticipant = swapSlotAssignments(participant, {
      fromSlotIndex: command.fromSlotIndex,
      toSlotIndex: command.toSlotIndex,
      toSlotMetadata: command.toSlotMetadata,
      fromSlotMetadata: command.fromSlotMetadata,
    });

    const participants = [...session.participants];
    participants[participantIndex] = updatedParticipant;

    const updatedSession: DraftSession = {
      ...session,
      participants,
      updatedAt: new Date(),
    };

    await this.draftSessionRepository.save(updatedSession);
    return updatedSession;
  }
}
