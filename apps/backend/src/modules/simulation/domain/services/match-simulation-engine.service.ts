import type {
  GeneratedMatchEvent,
  MatchPlayerSnapshot,
  MatchSimulationConfig,
  MatchStatisticsSnapshot,
  MatchTeamSide,
  MatchTeamSnapshot,
  SimulatedMatchResult,
} from '../models/match-simulation.types';
import { DEFAULT_MATCH_SIMULATION_CONFIG } from '../models/match-simulation.types';

interface SeededRng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

function createRng(seed: number): SeededRng {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      const item = items[this.int(0, items.length - 1)];
      if (item === undefined) {
        throw new Error('Cannot pick from empty array');
      }
      return item;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = this.int(0, index);
        const current = copy[index];
        const swap = copy[swapIndex];
        if (current !== undefined && swap !== undefined) {
          copy[index] = swap;
          copy[swapIndex] = current;
        }
      }
      return copy;
    },
  };
}

const XG_BY_ATTACK: Record<string, number> = {
  LONG_SHOT: 0.03,
  BOX_SHOT: 0.25,
  PENALTY: 0.78,
  ONE_ON_ONE: 0.55,
  HEADER: 0.18,
  FREE_KICK: 0.08,
  CORNER_HEADER: 0.12,
};

export class MatchSimulationEngine {
  constructor(private readonly config: MatchSimulationConfig = DEFAULT_MATCH_SIMULATION_CONFIG) {}

  simulate(input: {
    readonly home: MatchTeamSnapshot;
    readonly away: MatchTeamSnapshot;
    readonly seed: number;
  }): SimulatedMatchResult {
    const rng = createRng(input.seed);
    const homeStrength = this.teamStrength(input.home, true);
    const awayStrength = this.teamStrength(input.away, false);

    let homeMomentum = 0;
    let awayMomentum = 0;
    let homeScore = 0;
    let awayScore = 0;
    let homeXg = 0;
    let awayXg = 0;

    const stats: {
      homeShots: number;
      awayShots: number;
      homeShotsOnTarget: number;
      awayShotsOnTarget: number;
      homeCorners: number;
      awayCorners: number;
      homeFouls: number;
      awayFouls: number;
      homeYellowCards: number;
      awayYellowCards: number;
      homeRedCards: number;
      awayRedCards: number;
      homeDangerousAttacks: number;
      awayDangerousAttacks: number;
    } = this.emptyStats();
    const events: GeneratedMatchEvent[] = [];
    const playerRatings = new Map<string, number>();

    for (const player of [...input.home.players, ...input.away.players]) {
      playerRatings.set(player.cardId, 6.2 + rng.next() * 0.6);
    }

    events.push({
      minute: 0,
      eventType: 'KICK_OFF',
      teamSide: 'NEUTRAL',
      playerName: null,
      secondaryPlayerName: null,
      cardId: null,
      commentary: `Maç başladı! ${input.home.displayName} - ${input.away.displayName}`,
      xgValue: null,
      isGoal: false,
    });

    const eventCount = rng.int(this.config.targetEventCountMin, this.config.targetEventCountMax);
    const minutes = rng
      .shuffle(Array.from({ length: 88 }, (_, index) => index + 2))
      .slice(0, eventCount);

    for (const minute of minutes.sort((left, right) => left - right)) {
      const attackingSide = this.pickAttackingSide(
        homeStrength,
        awayStrength,
        homeMomentum,
        awayMomentum,
        rng,
      );
      const attackingTeam = attackingSide === 'HOME' ? input.home : input.away;
      const defendingTeam = attackingSide === 'HOME' ? input.away : input.home;

      if (attackingSide === 'HOME') {
        stats.homeDangerousAttacks += 1;
      } else {
        stats.awayDangerousAttacks += 1;
      }

      const attackRoll = rng.next();
      if (attackRoll < 0.28) {
        events.push(this.buildDangerousAttack(minute, attackingSide, attackingTeam, rng));
        continue;
      }

      if (attackRoll < 0.38) {
        events.push(this.buildCorner(minute, attackingSide, attackingTeam, rng));
        if (attackingSide === 'HOME') {
          stats.homeCorners += 1;
        } else {
          stats.awayCorners += 1;
        }
        continue;
      }

      if (attackRoll < 0.44) {
        events.push(this.buildFreeKick(minute, attackingSide, attackingTeam, rng));
        continue;
      }

      if (attackRoll < 0.5 && minute > 15) {
        const cardEvent = this.buildCard(minute, attackingSide, defendingTeam, rng);
        events.push(cardEvent);
        if (cardEvent.eventType === 'YELLOW_CARD') {
          if (attackingSide === 'HOME') {
            stats.awayYellowCards += 1;
          } else {
            stats.homeYellowCards += 1;
          }
        }
        if (cardEvent.eventType === 'RED_CARD') {
          if (attackingSide === 'HOME') {
            stats.awayRedCards += 1;
          } else {
            stats.homeRedCards += 1;
          }
        }
        continue;
      }

      const shotType = this.pickShotType(rng);
      const shooter = this.pickShooter(attackingTeam, shotType, rng);
      const xg = this.xgForShot(shotType, shooter.overall, defendingTeam.matchPower);
      const goalChance = Math.min(0.94, xg * (1.45 + rng.next() * 0.55));

      if (attackingSide === 'HOME') {
        stats.homeShots += 1;
        homeXg += xg;
      } else {
        stats.awayShots += 1;
        awayXg += xg;
      }

      if (rng.next() < 0.55) {
        if (attackingSide === 'HOME') {
          stats.homeShotsOnTarget += 1;
        } else {
          stats.awayShotsOnTarget += 1;
        }
      }

      if (shotType === 'PENALTY') {
        events.push({
          minute,
          eventType: 'PENALTY',
          teamSide: attackingSide,
          playerName: shooter.displayName,
          secondaryPlayerName: null,
          cardId: shooter.cardId,
          commentary: `Penaltı kararı! ${this.labelPlayer(shooter.displayName, attackingTeam.displayName)} topun başında.`,
          xgValue: xg,
          isGoal: false,
        });
      }

      if (rng.next() < goalChance) {
        if (shotType !== 'PENALTY') {
          events.push(this.buildGoalChance(minute, attackingSide, attackingTeam));
        }

        if (rng.next() < 0.03) {
          events.push({
            minute,
            eventType: 'OFFSIDE_GOAL',
            teamSide: attackingSide,
            playerName: shooter.displayName,
            secondaryPlayerName: null,
            cardId: shooter.cardId,
            commentary: `${this.labelPlayer(shooter.displayName, attackingTeam.displayName)} ağları buldu… ama bayrak kalktı! Ofsayt, gol geçersiz.`,
            xgValue: xg,
            isGoal: false,
          });
          continue;
        }

        if (attackingSide === 'HOME') {
          homeScore += 1;
          homeMomentum += 0.15;
          awayMomentum -= 0.1;
        } else {
          awayScore += 1;
          awayMomentum += 0.15;
          homeMomentum -= 0.1;
        }

        this.bumpRating(playerRatings, shooter.cardId, 1.1);
        const assister = this.pickAssister(attackingTeam, shooter, rng);
        events.push({
          minute,
          eventType: 'GOAL',
          teamSide: attackingSide,
          playerName: shooter.displayName,
          secondaryPlayerName: assister?.displayName ?? null,
          cardId: shooter.cardId,
          commentary: this.goalCommentary(
            shooter.displayName,
            attackingTeam.displayName,
            shotType,
            rng,
            assister?.displayName ?? null,
          ),
          xgValue: xg,
          isGoal: true,
        });
        continue;
      }

      if (shotType === 'PENALTY') {
        events.push({
          minute,
          eventType: 'MISSED_PENALTY',
          teamSide: attackingSide,
          playerName: shooter.displayName,
          secondaryPlayerName: null,
          cardId: shooter.cardId,
          commentary: `Kurtarış! ${this.labelPlayer(shooter.displayName, attackingTeam.displayName)} penaltıyı kaçırdı.`,
          xgValue: xg,
          isGoal: false,
        });
        continue;
      }

      if (rng.next() < 0.12) {
        events.push({
          minute,
          eventType: 'WOODWORK',
          teamSide: attackingSide,
          playerName: shooter.displayName,
          secondaryPlayerName: null,
          cardId: shooter.cardId,
          commentary: `${this.labelPlayer(shooter.displayName, attackingTeam.displayName)} çok sert vurdu — direkten döndü! ${attackingTeam.displayName} için çok yakın.`,
          xgValue: xg,
          isGoal: false,
        });
        continue;
      }

      const isOnTarget = rng.next() < 0.62;

      events.push({
        minute,
        eventType: isOnTarget ? 'SHOT_ON_TARGET' : 'SHOT',
        teamSide: attackingSide,
        playerName: shooter.displayName,
        secondaryPlayerName: null,
        cardId: shooter.cardId,
        commentary: this.shotCommentary(
          shooter.displayName,
          attackingTeam.displayName,
          shotType,
          rng,
        ),
        xgValue: xg,
        isGoal: false,
      });
    }

    events.push({
      minute: 45,
      eventType: 'HALF_TIME',
      teamSide: 'NEUTRAL',
      playerName: null,
      secondaryPlayerName: null,
      cardId: null,
      commentary: `İlk yarı sona erdi: ${input.home.displayName} ${homeScore} - ${awayScore} ${input.away.displayName}`,
      xgValue: null,
      isGoal: false,
    });

    events.push({
      minute: 90,
      eventType: 'FULL_TIME',
      teamSide: 'NEUTRAL',
      playerName: null,
      secondaryPlayerName: null,
      cardId: null,
      commentary: `Maç bitti: ${input.home.displayName} ${homeScore} - ${awayScore} ${input.away.displayName}`,
      xgValue: null,
      isGoal: false,
    });

    const possession = this.calculatePossession(homeStrength, awayStrength, stats);
    const manOfTheMatchCardId = this.pickManOfTheMatch(playerRatings, input.home, input.away, rng);

    return {
      homeScore,
      awayScore,
      homeXg: round2(homeXg),
      awayXg: round2(awayXg),
      events,
      statistics: {
        ...stats,
        homePossession: possession.home,
        awayPossession: possession.away,
        playerRatings: Object.fromEntries(playerRatings),
      },
      manOfTheMatchCardId,
      seed: input.seed,
    };
  }

  private teamStrength(team: MatchTeamSnapshot, isHome: boolean): number {
    const chemistryBoost = Math.min(
      this.config.chemistryImpactCap,
      (team.teamChemistry / 33) * this.config.chemistryImpactCap,
    );
    const homeBoost = isHome ? this.config.homeAdvantagePercent / 100 : 0;
    return team.matchPower * (1 + chemistryBoost + homeBoost);
  }

  private pickAttackingSide(
    homeStrength: number,
    awayStrength: number,
    homeMomentum: number,
    awayMomentum: number,
    rng: SeededRng,
  ): MatchTeamSide {
    const homeWeight = homeStrength * (1 + homeMomentum);
    const awayWeight = awayStrength * (1 + awayMomentum);
    const total = homeWeight + awayWeight;
    return rng.next() < homeWeight / total ? 'HOME' : 'AWAY';
  }

  private pickShotType(rng: SeededRng): keyof typeof XG_BY_ATTACK {
    const roll = rng.next();
    if (roll < 0.06) return 'PENALTY';
    if (roll < 0.16) return 'ONE_ON_ONE';
    if (roll < 0.34) return 'BOX_SHOT';
    if (roll < 0.5) return 'HEADER';
    if (roll < 0.62) return 'FREE_KICK';
    return 'LONG_SHOT';
  }

  private xgForShot(
    shotType: keyof typeof XG_BY_ATTACK,
    shooterOverall: number,
    defendingPower: number,
  ): number {
    const base = XG_BY_ATTACK[shotType] ?? 0.1;
    const qualityFactor = 0.85 + (shooterOverall - 70) / 100;
    const defenseFactor = 1.05 - defendingPower / 200;
    return round2(Math.max(0.01, Math.min(0.95, base * qualityFactor * defenseFactor)));
  }

  private pickShooter(
    team: MatchTeamSnapshot,
    shotType: keyof typeof XG_BY_ATTACK,
    rng: SeededRng,
  ): MatchPlayerSnapshot {
    const attackers = team.players.filter((player) =>
      ['ST', 'CF', 'LW', 'RW', 'CAM', 'LAM', 'RAM'].includes(player.positionCode),
    );
    const midfielders = team.players.filter((player) =>
      ['CM', 'CDM', 'LCM', 'RCM', 'LDM', 'RDM'].includes(player.positionCode),
    );
    const defenders = team.players.filter((player) =>
      ['CB', 'LCB', 'RCB', 'LB', 'RB'].includes(player.positionCode),
    );

    if (shotType === 'HEADER' || shotType === 'CORNER_HEADER') {
      return rng.pick(defenders.length > 0 ? defenders : team.players);
    }
    if (shotType === 'LONG_SHOT' || shotType === 'FREE_KICK') {
      return rng.pick(midfielders.length > 0 ? midfielders : team.players);
    }
    return rng.pick(attackers.length > 0 ? attackers : team.players);
  }

  private pickAssister(
    team: MatchTeamSnapshot,
    scorer: MatchPlayerSnapshot,
    rng: SeededRng,
  ): MatchPlayerSnapshot | null {
    const candidates = team.players.filter((player) => player.cardId !== scorer.cardId);
    if (candidates.length === 0 || rng.next() > 0.7) {
      return null;
    }
    return rng.pick(candidates);
  }

  private labelPlayer(playerName: string, teamName: string): string {
    return `${playerName} (${teamName})`;
  }

  private buildDangerousAttack(
    minute: number,
    side: MatchTeamSide,
    team: MatchTeamSnapshot,
    rng: SeededRng,
  ): GeneratedMatchEvent {
    const player = rng.pick(team.players);
    const label = this.labelPlayer(player.displayName, team.displayName);
    const templates = [
      `${label} sağ kanattan tehlikeli bir atağa çıkıyor.`,
      `${team.displayName} orta sahada pas trafiğiyle rakip ceza sahasına yaklaşıyor.`,
      `${label} oyunu sol kanada çeviriyor, rakip savunma geriliyor.`,
      `${team.displayName} topu kaptı ve hızlı hücuma kalktı!`,
      `${label} ceza sahası çevresinde baskı kuruyor.`,
      `${team.displayName} kanat organizasyonuyla tehlikeli bölgeye indi.`,
    ];
    return {
      minute,
      eventType: 'DANGEROUS_ATTACK',
      teamSide: side,
      playerName: player.displayName,
      secondaryPlayerName: null,
      cardId: player.cardId,
      commentary: rng.pick(templates),
      xgValue: null,
      isGoal: false,
    };
  }

  private buildGoalChance(
    minute: number,
    side: MatchTeamSide,
    team: MatchTeamSnapshot,
  ): GeneratedMatchEvent {
    return {
      minute,
      eventType: 'GOAL_CHANCE',
      teamSide: side,
      playerName: null,
      secondaryPlayerName: null,
      cardId: null,
      commentary: `Gol pozisyonu! ${team.displayName} tehlikede!`,
      xgValue: null,
      isGoal: false,
    };
  }

  private buildCorner(
    minute: number,
    side: MatchTeamSide,
    team: MatchTeamSnapshot,
    rng: SeededRng,
  ): GeneratedMatchEvent {
    const taker = rng.pick(team.players);
    return {
      minute,
      eventType: 'CORNER',
      teamSide: side,
      playerName: taker.displayName,
      secondaryPlayerName: null,
      cardId: taker.cardId,
      commentary: `Korner ${team.displayName}. Ortayı ${this.labelPlayer(taker.displayName, team.displayName)} kullanacak.`,
      xgValue: null,
      isGoal: false,
    };
  }

  private buildFreeKick(
    minute: number,
    side: MatchTeamSide,
    team: MatchTeamSnapshot,
    rng: SeededRng,
  ): GeneratedMatchEvent {
    const taker = rng.pick(team.players);
    return {
      minute,
      eventType: 'FREE_KICK',
      teamSide: side,
      playerName: taker.displayName,
      secondaryPlayerName: null,
      cardId: taker.cardId,
      commentary: `Serbest vuruş ${team.displayName}. ${this.labelPlayer(taker.displayName, team.displayName)} topu hazırlıyor.`,
      xgValue: XG_BY_ATTACK.FREE_KICK ?? 0.08,
      isGoal: false,
    };
  }

  private buildCard(
    minute: number,
    attackingSide: MatchTeamSide,
    defendingTeam: MatchTeamSnapshot,
    rng: SeededRng,
  ): GeneratedMatchEvent {
    const player = rng.pick(defendingTeam.players);
    const isRed = rng.next() < 0.08;
    return {
      minute,
      eventType: isRed ? 'RED_CARD' : 'YELLOW_CARD',
      teamSide: attackingSide === 'HOME' ? 'AWAY' : 'HOME',
      playerName: player.displayName,
      secondaryPlayerName: null,
      cardId: player.cardId,
      commentary: isRed
        ? `Kırmızı kart! ${this.labelPlayer(player.displayName, defendingTeam.displayName)} oyundan atıldı.`
        : `Sarı kart: ${this.labelPlayer(player.displayName, defendingTeam.displayName)}.`,
      xgValue: null,
      isGoal: false,
    };
  }

  private shotCommentary(
    shooter: string,
    teamName: string,
    shotType: keyof typeof XG_BY_ATTACK,
    rng: SeededRng,
  ): string {
    const label = this.labelPlayer(shooter, teamName);
    const lines: Record<string, string[]> = {
      LONG_SHOT: [`${label} uzaktan şut çekti!`, `${label} ceza sahası dışından kaleyi yokladı.`],
      BOX_SHOT: [
        `${label} ceza sahası içinden vurdu!`,
        `${label} döndü ve şutunu çekti — savunma araya girdi!`,
      ],
      ONE_ON_ONE: [
        `${label} kaleciyle karşı karşıya!`,
        `${label} boş alana sarktı, kaleciyle göz göze!`,
      ],
      HEADER: [
        `${label} yükseldi ama kafayı istediği yere gönderemedi.`,
        `${label} ortaya kafayla vurdu.`,
      ],
      FREE_KICK: [
        `${label} serbest vuruşu üstten auta gönderdi.`,
        `${label} frikikte kaleyi zorladı.`,
      ],
      PENALTY: [`${label} kaleciyi okudu ama top dışarı gitti.`, `${label} penaltıda yere vurdu.`],
      CORNER_HEADER: [`${label} kornerden kafayla dokundu.`],
    };
    return rng.pick(lines[shotType] ?? [`${label} şut denedi.`]);
  }

  private goalCommentary(
    scorer: string,
    teamName: string,
    shotType: keyof typeof XG_BY_ATTACK,
    rng: SeededRng,
    assisterName: string | null,
  ): string {
    const label = this.labelPlayer(scorer, teamName);
    const assistText =
      assisterName === null ? '' : ` Asist: ${this.labelPlayer(assisterName, teamName)}.`;

    if (shotType === 'PENALTY') {
      return `GOL! ${label} penaltıyı gole çevirdi!${assistText}`;
    }
    const lines = [
      `GOL! ${label} müthiş bitirdi!${assistText}`,
      `GOOOOL! ${label} köşeye yerleştirdi!${assistText}`,
      `${label} skoru değiştirdi! ${teamName} öne geçti!${assistText}`,
      `GOL! ${label} soğukkanlılıkla ağları sarstı!${assistText}`,
    ];
    return rng.pick(lines);
  }

  private emptyStats(): Omit<
    MatchStatisticsSnapshot,
    'homePossession' | 'awayPossession' | 'playerRatings'
  > {
    return {
      homeShots: 0,
      awayShots: 0,
      homeShotsOnTarget: 0,
      awayShotsOnTarget: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeDangerousAttacks: 0,
      awayDangerousAttacks: 0,
    };
  }

  private calculatePossession(
    homeStrength: number,
    awayStrength: number,
    stats: Omit<MatchStatisticsSnapshot, 'homePossession' | 'awayPossession' | 'playerRatings'>,
  ): { home: number; away: number } {
    const attackWeight = stats.homeDangerousAttacks + stats.homeShots * 2 + homeStrength * 0.4;
    const awayWeight = stats.awayDangerousAttacks + stats.awayShots * 2 + awayStrength * 0.4;
    const total = attackWeight + awayWeight;
    const home = Math.round((attackWeight / total) * 100);
    return { home, away: 100 - home };
  }

  private bumpRating(ratings: Map<string, number>, cardId: string, amount: number): void {
    ratings.set(cardId, round2((ratings.get(cardId) ?? 6.5) + amount));
  }

  private pickManOfTheMatch(
    ratings: Map<string, number>,
    home: MatchTeamSnapshot,
    away: MatchTeamSnapshot,
    rng: SeededRng,
  ): string | null {
    const entries = [...ratings.entries()];
    if (entries.length === 0) {
      return null;
    }
    entries.sort((left, right) => right[1] - left[1]);
    const top = entries[0];
    if (top !== undefined && top[1] >= 7.5) {
      return top[0];
    }
    const pool = [...home.players, ...away.players];
    return rng.pick(pool).cardId;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
