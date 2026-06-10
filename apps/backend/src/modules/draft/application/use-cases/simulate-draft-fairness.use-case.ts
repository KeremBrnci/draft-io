import type { DraftFairnessSimulationResultDto } from '@draft-io/shared-types';

import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import type { DraftPickOption } from '../../domain/models/draft-pick-option';
import type { DraftPoolCard } from '../../domain/models/draft-pool-card';
import {
  applyPick,
  createParticipantDraftState,
  pickCost,
  picksRemaining,
  remainingBudget,
} from '../../domain/models/participant-draft-state';
import { BudgetAllocator } from '../../domain/services/budget-allocator.service';
import { ChemistryCalculator } from '../../domain/services/chemistry-calculator.service';
import { MatchPowerCalculator } from '../../domain/services/match-power-calculator.service';
import { PickOptionGenerator } from '../../domain/services/pick-option-generator.service';
import { SurpriseLedgerService } from '../../domain/services/surprise-ledger.service';
import { TierClassifier } from '../../domain/services/tier-classifier.service';
import { SeededRandomSource } from '../../infrastructure/random/seeded-random-source';
import type { SimulateDraftFairnessCommand } from '../commands/draft-balance.commands';

const FORMATION_POSITIONS = [
  'GK',
  'CB',
  'CB',
  'LB',
  'RB',
  'CDM',
  'CM',
  'CM',
  'LW',
  'RW',
  'ST',
] as const;

export class SimulateDraftFairnessUseCase {
  async execute(command: SimulateDraftFairnessCommand): Promise<DraftFairnessSimulationResultDto> {
    const config = DEFAULT_DRAFT_BALANCE_CONFIG;
    const participantCount = command.participantCount ?? 4;
    const runCount = command.runCount ?? 1000;
    const pool = this.buildSyntheticPool();

    const participantIds = Array.from({ length: participantCount }, (_, index) => `p-${index}`);
    const overallByParticipant = participantIds.map(() => [] as number[]);
    const chemistryByParticipant = participantIds.map(() => [] as number[]);
    const matchPowerByParticipant = participantIds.map(() => [] as number[]);
    const eliteByParticipant = participantIds.map(() => [] as number[]);
    const runSpreads: number[] = [];

    for (let run = 0; run < runCount; run += 1) {
      const random = new SeededRandomSource((command.seed ?? 42) + run);
      const budgetAllocator = new BudgetAllocator(config, random);
      const budgets = budgetAllocator.allocateForParticipants(participantIds);

      const states = participantIds.map((participantId) =>
        createParticipantDraftState({
          participantId,
          powerBudget:
            budgets.get(participantId) ?? config.targetTeamAverageOverall * config.rosterSize,
        }),
      );

      const usedCardIds = new Set<string>();
      const tierClassifier = new TierClassifier(config);
      const surpriseLedger = new SurpriseLedgerService(config);
      const chemistryCalculator = new ChemistryCalculator(config.chemistry);
      const matchPowerCalculator = new MatchPowerCalculator(config.matchPower);

      for (let pickIndex = 0; pickIndex < config.rosterSize * participantCount; pickIndex += 1) {
        const round = Math.floor(pickIndex / participantCount);
        const positionInRound = pickIndex % participantCount;
        const participantIndex =
          round % 2 === 0 ? positionInRound : participantCount - 1 - positionInRound;
        const positionCode = FORMATION_POSITIONS[round] ?? 'CM';
        const state = states[participantIndex];
        if (state === undefined) {
          continue;
        }

        const draftedRoster = pool.filter((card) => state.draftedCardIds.includes(card.cardId));
        let eligiblePool = pool.filter(
          (card) =>
            !usedCardIds.has(card.cardId) &&
            card.positions.some((position) => position.positionCode === positionCode),
        );

        if (eligiblePool.length === 0) {
          eligiblePool = pool.filter((card) => !usedCardIds.has(card.cardId));
        }

        const generator = new PickOptionGenerator(config, random);
        const options = generator.generate({
          positionCode,
          participantState: state,
          pool: eligiblePool,
          draftedRoster,
        });

        const selected = this.selectSimulationPick(state, options, config);
        if (selected === undefined) {
          continue;
        }

        const card = pool.find((entry) => entry.cardId === selected.cardId);
        if (card === undefined) {
          continue;
        }

        usedCardIds.add(card.cardId);
        const tierCode = tierClassifier.classify(card.overall);
        const isElite = tierClassifier.isEliteTier(tierCode);

        const updated = applyPick(state, card, {
          pickCost: pickCost(card, config.pickCostMultiplier),
          isElite,
          eliteDebtAmount: surpriseLedger.eliteDebtAmount(tierCode),
          eliteCreditAmount: surpriseLedger.eliteCreditAmount(),
        });

        states[participantIndex] = updated;
      }

      for (let index = 0; index < participantCount; index += 1) {
        const state = states[index];
        if (state === undefined) {
          continue;
        }

        const drafted = pool.filter((card) => state.draftedCardIds.includes(card.cardId));
        const avgOverall =
          drafted.length === 0
            ? 0
            : drafted.reduce((sum, card) => sum + card.overall, 0) / drafted.length;

        const chemistry = chemistryCalculator.calculateTeamChemistry(
          drafted.map((card) => ({
            cardId: card.cardId,
            teamId: card.teamId,
            leagueId: card.leagueId,
            nationality: card.nationality,
          })),
        );
        const matchPower = matchPowerCalculator.calculate(avgOverall, chemistry.teamChemistry);

        overallByParticipant[index]?.push(avgOverall);
        chemistryByParticipant[index]?.push(chemistry.teamChemistry);
        matchPowerByParticipant[index]?.push(matchPower.matchPower);
        eliteByParticipant[index]?.push(state.elitePicksTaken);
      }

      const runOveralls = states
        .map((state) => {
          const drafted = pool.filter((card) => state.draftedCardIds.includes(card.cardId));
          if (drafted.length === 0) {
            return 0;
          }
          return drafted.reduce((sum, card) => sum + card.overall, 0) / drafted.length;
        })
        .filter((value) => value > 0);

      if (runOveralls.length > 0) {
        runSpreads.push(Math.max(...runOveralls) - Math.min(...runOveralls));
      }
    }

    const perParticipantStats = participantIds.map((_, index) => ({
      participantIndex: index,
      meanOverall: mean(overallByParticipant[index] ?? []),
      meanChemistry: mean(chemistryByParticipant[index] ?? []),
      meanMatchPower: mean(matchPowerByParticipant[index] ?? []),
      elitePickRate: mean(eliteByParticipant[index] ?? []),
    }));

    const allOverallMeans = perParticipantStats.map((stat) => stat.meanOverall);

    return {
      runCount,
      participantCount,
      averageTeamOverallMean: mean(allOverallMeans),
      averageTeamOverallStdDev: stdDev(allOverallMeans),
      averageOverallSpread: mean(runSpreads),
      maxOverallSpread:
        runSpreads.length === 0 ? 0 : runSpreads.reduce((max, spread) => Math.max(max, spread), 0),
      averageChemistryMean: mean(perParticipantStats.map((stat) => stat.meanChemistry)),
      averageMatchPowerMean: mean(perParticipantStats.map((stat) => stat.meanMatchPower)),
      perParticipantStats,
    };
  }

  private buildSyntheticPool(): readonly DraftPoolCard[] {
    const cards: DraftPoolCard[] = [];
    let idCounter = 0;

    const addCards = (input: {
      count: number;
      overallRange: [number, number];
      positions: readonly string[];
      cardTypeCode?: string;
      cardRarityCode?: string;
      teamId?: string | null;
      leagueId?: string | null;
      nationality?: string;
    }): void => {
      for (let index = 0; index < input.count; index += 1) {
        const overall =
          input.overallRange[0] +
          Math.floor(((index + 1) / input.count) * (input.overallRange[1] - input.overallRange[0]));

        cards.push({
          cardId: `card-${(idCounter += 1)}`,
          playerId: `player-${idCounter}`,
          displayName: `Player ${idCounter}`,
          overall,
          cardTypeCode: input.cardTypeCode ?? 'BASE',
          cardRarityCode: input.cardRarityCode ?? 'COMMON',
          teamId: input.teamId ?? `team-${index % 8}`,
          leagueId: input.leagueId ?? `league-${index % 4}`,
          nationality: input.nationality ?? `NAT-${index % 6}`,
          imageUrl: null,
          nationalityFlagUrl: null,
          leagueName: null,
          leagueLogoUrl: null,
          positions: input.positions.map((positionCode, positionIndex) => ({
            positionCode,
            isPrimary: positionIndex === 0,
            sortOrder: positionIndex,
          })),
        });
      }
    };

    addCards({ count: 20, overallRange: [92, 99], positions: ['ST', 'LW', 'RW', 'CM'] });
    addCards({ count: 40, overallRange: [88, 91], positions: ['CM', 'CDM', 'CB', 'LB', 'RB'] });
    addCards({ count: 60, overallRange: [84, 87], positions: ['CM', 'CB', 'LB', 'RB', 'CDM'] });
    addCards({ count: 80, overallRange: [80, 83], positions: ['CM', 'CB', 'GK', 'ST'] });
    addCards({ count: 60, overallRange: [75, 79], positions: ['CM', 'CB', 'GK', 'ST'] });
    addCards({
      count: 10,
      overallRange: [90, 95],
      positions: ['ST', 'CM'],
      cardTypeCode: 'ICON',
      cardRarityCode: 'LEGENDARY',
    });

    return cards;
  }

  private selectSimulationPick(
    state: ReturnType<typeof createParticipantDraftState>,
    options: readonly DraftPickOption[],
    config: typeof DEFAULT_DRAFT_BALANCE_CONFIG,
  ): DraftPickOption | undefined {
    if (options.length === 0) {
      return undefined;
    }

    const slotsLeft = picksRemaining(state, config.rosterSize);
    const budgetLeft = remainingBudget(state);
    const targetOverall = slotsLeft <= 0 ? config.targetTeamAverageOverall : budgetLeft / slotsLeft;

    return [...options].sort((left, right) => {
      const leftDistance = Math.abs(left.overall - targetOverall);
      const rightDistance = Math.abs(right.overall - targetOverall);
      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
      return right.overall - left.overall;
    })[0];
  }
}

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const avg = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
