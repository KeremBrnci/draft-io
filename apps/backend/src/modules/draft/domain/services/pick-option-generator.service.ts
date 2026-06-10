import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

import type { DraftPoolCard } from '../models/draft-pool-card';
import type { DraftPickOption, DraftPickOptionKind } from '../models/draft-pick-option';
import type { ParticipantDraftState } from '../models/participant-draft-state';
import type { PlayerIdentityLink } from '../models/chemistry-result';
import type { RandomSource } from '../ports/random-source.port';
import { canAffordPick, pickCost } from '../models/participant-draft-state';
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
      );

    if (eligible.length === 0) {
      return [];
    }

    const usedCardIds = new Set<string>();
    const usedPlayerIds = new Set<string>(draftedPlayerIds);
    const options: DraftPickOption[] = [];
    const kinds: DraftPickOptionKind[] = ['STRONG', 'MEDIUM', 'RISKY', 'CHEMISTRY', 'WILDCARD'];

    for (const kind of kinds) {
      const option = this.selectForKind({
        kind,
        positionCode,
        eligible,
        usedCardIds,
        usedPlayerIds,
        participantState,
        teammateLinks,
      });

      if (option === null) {
        continue;
      }

      usedCardIds.add(option.cardId);
      usedPlayerIds.add(option.playerId);
      options.push(option);
    }

    return this.fillToTarget(
      options,
      eligible,
      usedCardIds,
      usedPlayerIds,
      teammateLinks,
      positionCode,
    );
  }

  private selectForKind(input: {
    readonly kind: DraftPickOptionKind;
    readonly positionCode: string;
    readonly eligible: readonly DraftPoolCard[];
    readonly usedCardIds: ReadonlySet<string>;
    readonly usedPlayerIds: ReadonlySet<string>;
    readonly participantState: ParticipantDraftState;
    readonly teammateLinks: readonly PlayerIdentityLink[];
  }): DraftPickOption | null {
    const available = input.eligible.filter(
      (card) => !input.usedCardIds.has(card.cardId) && !input.usedPlayerIds.has(card.playerId),
    );
    if (available.length === 0) {
      return null;
    }

    let candidates = available;

    switch (input.kind) {
      case 'STRONG':
        candidates = this.filterByTiers(available, ['S', 'A', 'B']);
        candidates = this.sortByOverall(candidates, 'desc');
        break;
      case 'MEDIUM':
        candidates = this.filterByTiers(available, ['B', 'C']);
        candidates = this.sortByOverall(candidates, 'desc');
        break;
      case 'RISKY':
        candidates = this.filterByTiers(available, ['C', 'D']);
        candidates = this.sortByOverall(candidates, 'asc');
        break;
      case 'CHEMISTRY':
        candidates = [...available].sort(
          (left, right) =>
            this.projectedChemistry(right, input.teammateLinks) -
            this.projectedChemistry(left, input.teammateLinks),
        );
        break;
      case 'WILDCARD':
        if (!this.surpriseLedger.shouldOfferWildcard(input.participantState, this.random.next())) {
          candidates = this.sortByOverall(available, 'desc').slice(-Math.min(5, available.length));
          break;
        }
        candidates = available.filter((card) => this.isWildcardCard(card));
        if (candidates.length === 0) {
          candidates = available.filter(
            (card) => this.projectedChemistry(card, input.teammateLinks) >= 2,
          );
        }
        candidates = this.random.shuffle(candidates);
        break;
    }

    if (candidates.length === 0) {
      candidates = available;
    }

    const weighted = candidates.map((card) => {
      const tierCode = this.tierClassifier.classify(card.overall);
      const positionWeight = this.positionCompatibility.getWeight(card, input.positionCode);
      const eliteWeight = this.surpriseLedger.eliteOfferWeight(input.participantState, tierCode);
      return {
        card,
        weight: positionWeight * eliteWeight,
      };
    });

    const selected = this.weightedPick(weighted);
    if (selected === null) {
      return null;
    }

    const tierCode = this.tierClassifier.classify(selected.overall);
    const isWildcard = input.kind === 'WILDCARD' || this.isWildcardCard(selected);

    return this.toOption({
      card: selected,
      kind: input.kind,
      tierCode,
      isWildcard,
      positionCode: input.positionCode,
      teammateLinks: input.teammateLinks,
    });
  }

  private fillToTarget(
    options: DraftPickOption[],
    eligible: readonly DraftPoolCard[],
    usedCardIds: Set<string>,
    usedPlayerIds: Set<string>,
    teammateLinks: readonly PlayerIdentityLink[],
    positionCode: string,
  ): readonly DraftPickOption[] {
    const target = this.config.candidatesPerPick;
    const result = [...options];

    while (result.length < target) {
      const remaining = eligible.filter(
        (card) => !usedCardIds.has(card.cardId) && !usedPlayerIds.has(card.playerId),
      );
      if (remaining.length === 0) {
        break;
      }

      const card = this.random.shuffle(remaining)[0];
      if (card === undefined) {
        break;
      }

      usedCardIds.add(card.cardId);
      usedPlayerIds.add(card.playerId);
      const tierCode = this.tierClassifier.classify(card.overall);
      result.push(
        this.toOption({
          card,
          kind: 'MEDIUM',
          tierCode,
          isWildcard: false,
          positionCode,
          teammateLinks,
        }),
      );
    }

    return result;
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

  private filterByTiers(
    cards: readonly DraftPoolCard[],
    tiers: readonly string[],
  ): DraftPoolCard[] {
    const filtered = cards.filter((card) =>
      tiers.includes(this.tierClassifier.classify(card.overall)),
    );
    return filtered.length > 0 ? filtered : [...cards];
  }

  private sortByOverall(
    cards: readonly DraftPoolCard[],
    direction: 'asc' | 'desc',
  ): DraftPoolCard[] {
    return [...cards].sort((left, right) =>
      direction === 'desc' ? right.overall - left.overall : left.overall - right.overall,
    );
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
