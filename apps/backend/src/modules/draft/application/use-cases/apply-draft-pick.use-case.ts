import type { ApplyDraftPickCommand } from '../commands/draft-balance.commands';
import {
  DraftParticipantNotFoundError,
  DraftSessionNotFoundError,
  InvalidDraftPickError,
} from '../../domain/errors/draft.errors';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import {
  applyPick,
  canAffordPick,
  pickCost,
  picksRemaining,
} from '../../domain/models/participant-draft-state';
import { expandDraftEligiblePositionCodes } from '../../domain/services/expand-draft-position-codes';
import { PositionCompatibilityService } from '../../domain/services/position-compatibility.service';
import { SurpriseLedgerService } from '../../domain/services/surprise-ledger.service';
import { TierClassifier } from '../../domain/services/tier-classifier.service';

export class ApplyDraftPickUseCase {
  constructor(
    private readonly draftSessionRepository: DraftSessionRepository,
    private readonly draftPoolRepository: DraftPoolRepository,
  ) {}

  async execute(command: ApplyDraftPickCommand): Promise<DraftSession> {
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

    if (picksRemaining(participant, session.rosterSize) <= 0) {
      throw new InvalidDraftPickError('Roster is already full');
    }

    if (participant.draftedCardIds.includes(command.cardId)) {
      throw new InvalidDraftPickError('Card already drafted by participant');
    }

    if (command.slotAssignment !== undefined) {
      const slotTaken = participant.slotAssignments.some(
        (assignment) => assignment.slotIndex === command.slotAssignment!.slotIndex,
      );
      if (slotTaken) {
        throw new InvalidDraftPickError('Formation slot is already filled');
      }
    }

    const cards = await this.draftPoolRepository.findByIds([command.cardId]);
    const card = cards[0];
    if (card === undefined) {
      throw new InvalidDraftPickError('Card not found in draft pool');
    }

    const draftedRoster = await this.draftPoolRepository.findByIds(participant.draftedCardIds);
    if (draftedRoster.some((drafted) => drafted.playerId === card.playerId)) {
      throw new InvalidDraftPickError('Player already drafted');
    }

    const positionCompatibility = new PositionCompatibilityService(session.config.positionWeights);
    const slotPositionCodes =
      command.positionCodes !== undefined && command.positionCodes.length > 0
        ? command.positionCodes
        : [command.positionCode];
    const eligiblePositionCodes = expandDraftEligiblePositionCodes(slotPositionCodes);

    const isEligible = eligiblePositionCodes.some((code) =>
      positionCompatibility.isEligible(card, code),
    );

    if (!isEligible) {
      throw new InvalidDraftPickError('Card is not eligible for selected position');
    }

    if (
      !canAffordPick(
        participant,
        card,
        session.config.pickCostMultiplier,
        session.rosterSize,
      )
    ) {
      throw new InvalidDraftPickError('Pick exceeds remaining power budget');
    }

    const tierClassifier = new TierClassifier(session.config);
    const surpriseLedger = new SurpriseLedgerService(session.config);
    const tierCode = tierClassifier.classify(card.overall);
    const isElite = tierClassifier.isEliteTier(tierCode);
    const cost = pickCost(card, session.config.pickCostMultiplier);

    const updatedParticipant = applyPick(participant, card, {
      pickCost: cost,
      isElite,
      eliteDebtAmount: surpriseLedger.eliteDebtAmount(tierCode),
      eliteCreditAmount: surpriseLedger.eliteCreditAmount(),
      ...(command.slotAssignment !== undefined
        ? {
            slotAssignment: {
              slotIndex: command.slotAssignment.slotIndex,
              cardId: card.cardId,
              positionCode: command.positionCode,
              slotLabel: command.slotAssignment.slotLabel,
            },
          }
        : {}),
    });

    const draftedCards = await this.draftPoolRepository.findByIds(updatedParticipant.draftedCardIds);
    const withCredit = surpriseLedger.accrueLateLuckCredit(updatedParticipant, draftedCards);

    const participants = [...session.participants];
    participants[participantIndex] = withCredit;

    const updatedSession: DraftSession = {
      ...session,
      participants,
      updatedAt: new Date(),
    };

    await this.draftSessionRepository.save(updatedSession);
    return updatedSession;
  }
}
