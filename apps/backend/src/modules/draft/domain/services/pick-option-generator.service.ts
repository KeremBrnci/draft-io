import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

import {
  PICK_BOARD_COMPACT_RATE,
  PICK_BOARD_ELITE_RATE,
  PICK_BOARD_OVERALL_FLOOR,
  PICK_BOARD_WINDOWS,
  RECENTLY_OFFERED_WEIGHT_MULTIPLIER,
  type PickBoardProfile,
} from '../constants/pick-board-profile.constants';
import type { PlayerIdentityLink } from '../models/chemistry-result';
import type { DraftPickOption, DraftPickOptionKind } from '../models/draft-pick-option';
import type { DraftPoolCard } from '../models/draft-pool-card';
import type { ParticipantDraftState } from '../models/participant-draft-state';
import { canAffordPick, pickCost } from '../models/participant-draft-state';
import type { RandomSource } from '../ports/random-source.port';

import { ChemistryCalculator } from './chemistry-calculator.service';
import { PositionCompatibilityService } from './position-compatibility.service';
import { SurpriseLedgerService } from './surprise-ledger.service';
import { TierClassifier } from './tier-classifier.service';

const WILDCARD_TYPE_CODES = new Set(['ICON', 'HERO', 'TOTY', 'EVENT']);
const WILDCARD_RARITY_CODES = new Set(['RARE', 'EPIC', 'LEGENDARY']);

export class PickOptionGenerator {
  private readonly tierClassifier: TierClassifier;
  private readonly chemistryCalculator: ChemistryCalculator;
  private readonly positionCompatibility: PositionCompatibilityService;
  private readonly surpriseLedger: SurpriseLedgerService;

  constructor(
    private readonly config: DraftBalanceConfigDto,
    private readonly random: RandomSource,
  ) {
    this.tierClassifier = new TierClassifier(config);
    this.chemistryCalculator = new ChemistryCalculator(config.chemistry);
    this.positionCompatibility = new PositionCompatibilityService(config.positionWeights);
    this.surpriseLedger = new SurpriseLedgerService(config);
  }

  generate(input: {
    readonly positionCode: string;
    readonly eligiblePositionCodes?: readonly string[];
    readonly participantState: ParticipantDraftState;
    readonly pool: readonly DraftPoolCard[];
    readonly draftedRoster: readonly DraftPoolCard[];
  }): readonly DraftPickOption[] {
    const { positionCode, participantState, pool, draftedRoster } = input;
    const eligiblePositionCodes =
      input.eligiblePositionCodes !== undefined && input.eligiblePositionCodes.length > 0
        ? input.eligiblePositionCodes
        : [positionCode];
    const teammateLinks = this.toIdentityLinks(draftedRoster);
    const draftedPlayerIds = new Set(draftedRoster.map((card) => card.playerId));

    const eligible = pool
      .filter((card) =>
        eligiblePositionCodes.some((code) => this.positionCompatibility.isEligible(card, code)),
      )
      .filter((card) => !participantState.draftedCardIds.includes(card.cardId))
      .filter((card) => !draftedPlayerIds.has(card.playerId))
      .filter((card) =>
        canAffordPick(
          participantState,
          card,
          this.config.pickCostMultiplier,
          this.config.rosterSize,
        ),
      )
      .filter((card) => card.overall >= PICK_BOARD_OVERALL_FLOOR);

    if (eligible.length === 0) {
      return [];
    }

    const profile = this.sampleBoardProfile();
    const boardCandidates = this.resolveBoardCandidates(eligible, profile);
    const compactAnchor =
      profile === 'COMPACT'
        ? PICK_BOARD_WINDOWS.COMPACT.minOverall +
          this.random.nextInt(
            0,
            PICK_BOARD_WINDOWS.COMPACT.maxOverall! - PICK_BOARD_WINDOWS.COMPACT.minOverall,
          )
        : null;

    const selectedCards = this.selectDistinctCards({
      candidates: boardCandidates,
      fallbackCandidates: eligible,
      count: this.config.candidatesPerPick,
      positionCode,
      participantState,
      teammateLinks,
      profile,
      compactAnchor,
    });

    return this.buildOptionsFromCards(selectedCards, teammateLinks, positionCode);
  }

  private sampleBoardProfile(): PickBoardProfile {
    const roll = this.random.next();
    if (roll < PICK_BOARD_ELITE_RATE) {
      return 'ELITE';
    }
    if (roll < PICK_BOARD_ELITE_RATE + PICK_BOARD_COMPACT_RATE) {
      return 'COMPACT';
    }
    return 'SPREAD';
  }

  private resolveBoardCandidates(
    eligible: readonly DraftPoolCard[],
    profile: PickBoardProfile,
  ): DraftPoolCard[] {
    const window = PICK_BOARD_WINDOWS[profile];
    const target = this.config.candidatesPerPick;

    const inWindow = (card: DraftPoolCard, min: number, max: number | null): boolean => {
      if (card.overall < min) {
        return false;
      }
      return max === null || card.overall <= max;
    };

    let candidates = eligible.filter((card) =>
      inWindow(card, window.minOverall, window.maxOverall),
    );
    if (candidates.length >= target) {
      return [...candidates];
    }

    if (window.maxOverall !== null) {
      const expandedMaxOverall = window.maxOverall + 1;
      candidates = eligible.filter((card) =>
        inWindow(card, window.minOverall, expandedMaxOverall),
      );
      if (candidates.length >= target) {
        return [...candidates];
      }
    }

    if (profile === 'ELITE') {
      candidates = eligible.filter((card) => card.overall >= window.minOverall - 1);
      if (candidates.length >= target) {
        return [...candidates];
      }
    }

    candidates = eligible.filter((card) => card.overall >= PICK_BOARD_OVERALL_FLOOR);
    return candidates.length > 0 ? [...candidates] : [...eligible];
  }

  private selectDistinctCards(input: {
    readonly candidates: readonly DraftPoolCard[];
    readonly fallbackCandidates: readonly DraftPoolCard[];
    readonly count: number;
    readonly positionCode: string;
    readonly participantState: ParticipantDraftState;
    readonly teammateLinks: readonly PlayerIdentityLink[];
    readonly profile: PickBoardProfile;
    readonly compactAnchor: number | null;
  }): DraftPoolCard[] {
    const selected: DraftPoolCard[] = [];
    const usedCardIds = new Set<string>();
    const usedPlayerIds = new Set<string>();
    const recentlyOffered = new Set(input.participantState.recentlyOfferedPlayerIds);
    const pools = [input.candidates, input.fallbackCandidates];

    for (const pool of pools) {
      this.pickFromPool({
        pool,
        selected,
        usedCardIds,
        usedPlayerIds,
        recentlyOffered,
        count: input.count,
        allowRecentlyOffered: false,
        positionCode: input.positionCode,
        participantState: input.participantState,
        teammateLinks: input.teammateLinks,
        profile: input.profile,
        compactAnchor: input.compactAnchor,
      });

      if (selected.length >= input.count) {
        return selected;
      }
    }

    for (const pool of pools) {
      this.pickFromPool({
        pool,
        selected,
        usedCardIds,
        usedPlayerIds,
        recentlyOffered,
        count: input.count,
        allowRecentlyOffered: true,
        positionCode: input.positionCode,
        participantState: input.participantState,
        teammateLinks: input.teammateLinks,
        profile: input.profile,
        compactAnchor: input.compactAnchor,
      });

      if (selected.length >= input.count) {
        break;
      }
    }

    return selected;
  }

  private pickFromPool(input: {
    readonly pool: readonly DraftPoolCard[];
    readonly selected: DraftPoolCard[];
    readonly usedCardIds: Set<string>;
    readonly usedPlayerIds: Set<string>;
    readonly recentlyOffered: ReadonlySet<string>;
    readonly count: number;
    readonly allowRecentlyOffered: boolean;
    readonly positionCode: string;
    readonly participantState: ParticipantDraftState;
    readonly teammateLinks: readonly PlayerIdentityLink[];
    readonly profile: PickBoardProfile;
    readonly compactAnchor: number | null;
  }): void {
    const shuffled = this.random.shuffle([...input.pool]);

    while (input.selected.length < input.count) {
      const available = shuffled.filter(
        (card) => !input.usedCardIds.has(card.cardId) && !input.usedPlayerIds.has(card.playerId),
      );
      if (available.length === 0) {
        break;
      }

      const pickPool = input.allowRecentlyOffered
        ? available
        : available.filter((card) => !input.recentlyOffered.has(card.playerId));

      if (pickPool.length === 0) {
        break;
      }

      const weighted = pickPool.map((card) => ({
        card,
        weight: this.selectionWeight({
          card,
          positionCode: input.positionCode,
          participantState: input.participantState,
          teammateLinks: input.teammateLinks,
          profile: input.profile,
          compactAnchor: input.compactAnchor,
        }),
      }));

      const card = this.weightedPick(weighted);
      if (card === null) {
        break;
      }

      input.selected.push(card);
      input.usedCardIds.add(card.cardId);
      input.usedPlayerIds.add(card.playerId);
    }
  }

  private selectionWeight(input: {
    readonly card: DraftPoolCard;
    readonly positionCode: string;
    readonly participantState: ParticipantDraftState;
    readonly teammateLinks: readonly PlayerIdentityLink[];
    readonly profile: PickBoardProfile;
    readonly compactAnchor: number | null;
  }): number {
    const tierCode = this.tierClassifier.classify(input.card.overall);
    const positionWeight = this.positionCompatibility.getWeight(input.card, input.positionCode);
    const eliteWeight = this.surpriseLedger.eliteOfferWeight(input.participantState, tierCode);
    const recentlyOffered = new Set(input.participantState.recentlyOfferedPlayerIds);
    const repeatPenalty = recentlyOffered.has(input.card.playerId)
      ? RECENTLY_OFFERED_WEIGHT_MULTIPLIER
      : 1;

    let weight = positionWeight * eliteWeight * repeatPenalty;
    weight *= this.rotationWeight(input.card, input.participantState, input.positionCode);

    if (input.profile === 'COMPACT' && input.compactAnchor !== null) {
      const distance = Math.abs(input.card.overall - input.compactAnchor);
      weight *= 1 / (1 + distance * 0.45);
    }

    if (input.profile === 'ELITE' && input.card.overall >= 85) {
      weight *= 1.15;
    }

    const chemistryBoost = this.projectedChemistry(input.card, input.teammateLinks);
    if (chemistryBoost >= 2) {
      weight *= 1.08;
    }

    return Math.max(0.01, weight);
  }

  private rotationWeight(
    card: DraftPoolCard,
    participantState: ParticipantDraftState,
    positionCode: string,
  ): number {
    const hash = this.hashString(
      `${participantState.participantId}:${participantState.pickCount}:${positionCode}:${card.playerId}`,
    );
    return 0.82 + (hash % 36) / 100;
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  private buildOptionsFromCards(
    cards: readonly DraftPoolCard[],
    teammateLinks: readonly PlayerIdentityLink[],
    positionCode: string,
  ): readonly DraftPickOption[] {
    if (cards.length === 0) {
      return [];
    }

    const kindByCardId = new Map<string, DraftPickOptionKind>();
    const byOverallDesc = [...cards].sort((left, right) => right.overall - left.overall);
    const strongest = byOverallDesc[0];
    if (strongest !== undefined) {
      kindByCardId.set(strongest.cardId, 'STRONG');
    }

    const byOverallAsc = [...cards].sort((left, right) => left.overall - right.overall);
    const riskiest = byOverallAsc.find((card) => !kindByCardId.has(card.cardId)) ?? byOverallAsc[0];
    if (riskiest !== undefined) {
      kindByCardId.set(riskiest.cardId, 'RISKY');
    }

    const byChemistry = [...cards].sort(
      (left, right) =>
        this.projectedChemistry(right, teammateLinks) -
        this.projectedChemistry(left, teammateLinks),
    );
    const chemistryPick = byChemistry.find((card) => !kindByCardId.has(card.cardId));
    if (chemistryPick !== undefined) {
      kindByCardId.set(chemistryPick.cardId, 'CHEMISTRY');
    }

    const wildcardPick = cards.find(
      (card) => !kindByCardId.has(card.cardId) && this.isWildcardCard(card),
    );
    if (wildcardPick !== undefined) {
      kindByCardId.set(wildcardPick.cardId, 'WILDCARD');
    }

    for (const card of cards) {
      if (!kindByCardId.has(card.cardId)) {
        kindByCardId.set(card.cardId, 'MEDIUM');
      }
    }

    return cards.map((card) => {
      const tierCode = this.tierClassifier.classify(card.overall);
      const kind = kindByCardId.get(card.cardId) ?? 'MEDIUM';
      return this.toOption({
        card,
        kind,
        tierCode,
        isWildcard: kind === 'WILDCARD' || this.isWildcardCard(card),
        positionCode,
        teammateLinks,
      });
    });
  }

  private toOption(input: {
    readonly card: DraftPoolCard;
    readonly kind: DraftPickOptionKind;
    readonly tierCode: string;
    readonly isWildcard: boolean;
    readonly positionCode: string;
    readonly teammateLinks: readonly PlayerIdentityLink[];
  }): DraftPickOption {
    return {
      cardId: input.card.cardId,
      playerId: input.card.playerId,
      displayName: input.card.displayName,
      overall: input.card.overall,
      tierCode: input.tierCode,
      cardTypeCode: input.card.cardTypeCode,
      cardRarityCode: input.card.cardRarityCode,
      kind: input.kind,
      pickCost: pickCost(input.card, this.config.pickCostMultiplier),
      projectedChemistry: this.projectedChemistry(input.card, input.teammateLinks),
      positionWeight: this.positionCompatibility.getWeight(input.card, input.positionCode),
      isWildcard: input.isWildcard,
    };
  }

  private projectedChemistry(
    card: DraftPoolCard,
    teammates: readonly PlayerIdentityLink[],
  ): number {
    return this.chemistryCalculator.calculatePlayerChemistry(
      {
        cardId: card.cardId,
        teamId: card.teamId,
        leagueId: card.leagueId,
        nationality: card.nationality,
      },
      teammates,
    ).chemistry;
  }

  private toIdentityLinks(cards: readonly DraftPoolCard[]): readonly PlayerIdentityLink[] {
    return cards.map((card) => ({
      cardId: card.cardId,
      teamId: card.teamId,
      leagueId: card.leagueId,
      nationality: card.nationality,
    }));
  }

  private isWildcardCard(card: DraftPoolCard): boolean {
    return (
      WILDCARD_TYPE_CODES.has(card.cardTypeCode.toUpperCase()) ||
      WILDCARD_RARITY_CODES.has(card.cardRarityCode.toUpperCase())
    );
  }

  private weightedPick(
    items: readonly { readonly card: DraftPoolCard; readonly weight: number }[],
  ): DraftPoolCard | null {
    if (items.length === 0) {
      return null;
    }

    const totalWeight = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (totalWeight <= 0) {
      return items[0]?.card ?? null;
    }

    let threshold = this.random.next() * totalWeight;
    for (const item of items) {
      threshold -= Math.max(0, item.weight);
      if (threshold <= 0) {
        return item.card;
      }
    }

    return items[items.length - 1]?.card ?? null;
  }
}
