import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatsService } from '../stats/stats.service';
import { BADGE_CATALOG } from './badges.catalog';

const XP_PER_CORRECT_ANSWER = 5;
const XP_WIN_BONUS = 20;
const XP_TOURNAMENT_CHAMPION_BONUS = 100;

export interface MatchResultForGamification {
  player1Id: string;
  player2Id: string;
  winner: 0 | 1 | 2;
  player1CorrectCount: number;
  player2CorrectCount: number;
  totalQuestions: number;
}

@Injectable()
export class GamificationService implements OnModuleInit {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  // Insère/à jour le catalogue de badges au démarrage (idempotent).
  async onModuleInit() {
    for (const badge of BADGE_CATALOG) {
      await this.prisma.badge.upsert({
        where: { code: badge.code },
        update: { name: badge.name, description: badge.description },
        create: badge,
      });
    }
  }

  async processMatchResult(result: MatchResultForGamification) {
    const xp1 =
      result.player1CorrectCount * XP_PER_CORRECT_ANSWER +
      (result.winner === 1 ? XP_WIN_BONUS : 0);

    const xp2 =
      result.player2CorrectCount * XP_PER_CORRECT_ANSWER +
      (result.winner === 2 ? XP_WIN_BONUS : 0);

    await Promise.all([
      this.awardXp(result.player1Id, xp1),
      this.awardXp(result.player2Id, xp2),
    ]);

    await Promise.all([
      this.checkPerfectGame(
        result.player1Id,
        result.player1CorrectCount,
        result.totalQuestions,
      ),
      this.checkPerfectGame(
        result.player2Id,
        result.player2CorrectCount,
        result.totalQuestions,
      ),
      this.evaluateBadges(result.player1Id),
      this.evaluateBadges(result.player2Id),
    ]);
  }

  async awardTournamentChampionBonus(userId: string) {
    await this.awardXp(userId, XP_TOURNAMENT_CHAMPION_BONUS);
    await this.evaluateBadges(userId);
  }

  private async awardXp(userId: string, amount: number) {
    if (amount <= 0) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
    });
  }

  private async checkPerfectGame(
    userId: string,
    correctCount: number,
    totalQuestions: number,
  ) {
    if (totalQuestions > 0 && correctCount === totalQuestions) {
      await this.awardBadges(userId, ['PERFECT_GAME']);
    }
  }

  // Reconstitue les stats cumulées du joueur et débloque les badges à
  // seuil dont la condition est désormais remplie (opération idempotente,
  // protégée par la contrainte @@unique([userId, badgeId])).
  private async evaluateBadges(userId: string) {
    const [gamesPlayed, winLoss, tournamentsWon] = await Promise.all([
      this.statsService.getGamesPlayed(userId),
      this.statsService.getWinLossStats(userId),
      this.statsService.getTournamentsWon(userId),
    ]);

    const earnedCodes: string[] = [];

    if (winLoss.wins >= 1) earnedCodes.push('FIRST_WIN');
    if (winLoss.wins >= 10) earnedCodes.push('WINS_10');
    if (winLoss.wins >= 50) earnedCodes.push('WINS_50');
    if (gamesPlayed >= 10) earnedCodes.push('GAMES_10');
    if (gamesPlayed >= 100) earnedCodes.push('GAMES_100');
    if (tournamentsWon >= 1) earnedCodes.push('TOURNAMENT_CHAMPION');

    await this.awardBadges(userId, earnedCodes);
  }

  private async awardBadges(userId: string, codes: string[]) {
    if (codes.length === 0) return;

    const badges = await this.prisma.badge.findMany({
      where: { code: { in: codes } },
    });

    if (badges.length === 0) {
      this.logger.warn(
        `No matching badges found for codes: ${codes.join(', ')}`,
      );
      return;
    }

    await this.prisma.userBadge.createMany({
      data: badges.map((badge) => ({ userId, badgeId: badge.id })),
      skipDuplicates: true,
    });
  }
}
