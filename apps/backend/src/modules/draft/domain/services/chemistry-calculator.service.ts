import type { ChemistryConfig } from '../config/default-draft-balance.config';
import type {
  CoachIdentityLink,
  PlayerChemistry,
  PlayerIdentityLink,
  TeamChemistryResult,
} from '../models/chemistry-result';

export class ChemistryCalculator {
  constructor(private readonly config: ChemistryConfig) {}

  calculatePlayerChemistry(
    candidate: PlayerIdentityLink,
    teammates: readonly PlayerIdentityLink[],
  ): PlayerChemistry {
    let clubBonus = 0;
    let nationBonus = 0;
    let leagueBonus = 0;
    const sources = new Set<'club' | 'nation' | 'league'>();

    for (const teammate of teammates) {
      if (candidate.cardId === teammate.cardId) {
        continue;
      }

      if (
        candidate.teamId !== null &&
        teammate.teamId !== null &&
        candidate.teamId === teammate.teamId
      ) {
        clubBonus += this.config.sameClubBonus;
        sources.add('club');
      }

      if (candidate.nationality === teammate.nationality) {
        nationBonus += this.config.sameNationBonus;
        sources.add('nation');
      }

      if (
        candidate.leagueId !== null &&
        teammate.leagueId !== null &&
        candidate.leagueId === teammate.leagueId
      ) {
        leagueBonus += this.config.sameLeagueBonus;
        sources.add('league');
      }
    }

    const chemistry = Math.min(
      this.config.maxChemistryPerPlayer,
      clubBonus + nationBonus + leagueBonus,
    );

    return {
      cardId: candidate.cardId,
      chemistry,
      sources: [...sources],
    };
  }

  calculateCoachPlayerChemistry(
    player: PlayerIdentityLink,
    coach: CoachIdentityLink,
  ): PlayerChemistry {
    let chemistry = 0;
    const sources = new Set<'club' | 'nation' | 'league'>();

    if (coach.teamId !== null && player.teamId !== null && coach.teamId === player.teamId) {
      chemistry += this.config.sameClubBonus;
      sources.add('club');
    }

    if (player.nationality === coach.nationality) {
      chemistry += this.config.sameNationBonus;
      sources.add('nation');
    }

    if (coach.leagueId !== null && player.leagueId !== null && coach.leagueId === player.leagueId) {
      chemistry += this.config.sameLeagueBonus;
      sources.add('league');
    }

    return {
      cardId: player.cardId,
      chemistry: Math.min(this.config.maxChemistryPerPlayer, chemistry),
      sources: [...sources],
    };
  }

  calculateTeamChemistry(
    cards: readonly PlayerIdentityLink[],
    coach: CoachIdentityLink | null = null,
  ): TeamChemistryResult {
    const players = cards.map((card) => {
      const peerChemistry = this.calculatePlayerChemistry(
        card,
        cards.filter((other) => other.cardId !== card.cardId),
      );
      const coachChemistry =
        coach === null ? null : this.calculateCoachPlayerChemistry(card, coach);

      const chemistry = peerChemistry.chemistry + (coachChemistry?.chemistry ?? 0);
      const sources = new Set([...peerChemistry.sources, ...(coachChemistry?.sources ?? [])]);

      return {
        cardId: card.cardId,
        chemistry,
        sources: [...sources],
      };
    });

    const breakdown = { club: 0, nation: 0, league: 0 };

    for (const player of players) {
      let remaining = player.chemistry;
      if (player.sources.includes('club')) {
        const clubPart = Math.min(remaining, this.config.sameClubBonus);
        breakdown.club += clubPart;
        remaining -= clubPart;
      }
      if (remaining > 0 && player.sources.includes('nation')) {
        const nationPart = Math.min(remaining, this.config.sameNationBonus);
        breakdown.nation += nationPart;
        remaining -= nationPart;
      }
      if (remaining > 0 && player.sources.includes('league')) {
        breakdown.league += remaining;
      }
    }

    const teamChemistry = Math.min(
      this.config.maxTeamChemistry,
      players.reduce((sum, player) => sum + player.chemistry, 0),
    );

    return {
      teamChemistry,
      breakdown,
      players,
    };
  }
}
