import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';


interface CategoryStatEntry {
  categoryName: string;
  correct: number;
  total: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGamesPlayed(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    return this.prisma.roomParticipant.count({
      where: {
        userId,
        room: {
          status: RoomStatus.FINISHED,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
      },
    });
  }

  async getAnswerStats(userId: string, startDate?: Date, endDate?: Date) {
    const results = await this.prisma.answer.groupBy({
      by: ['isCorrect'],
      where: {
        participant: { userId },
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      _count: { _all: true },
    });

    const correct = results.find((r) => r.isCorrect === true)?._count._all ?? 0;
    const incorrect = results.find((r) => r.isCorrect === false)?._count._all ?? 0;
    const total = correct + incorrect;

    return {
      correct,
      incorrect,
      total,
      successRate: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }

  async getAverageResponseTime(userId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const result = await this.prisma.answer.aggregate({
      where: {
        participant: { userId },
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      _avg: { timeTakenMs: true },
    });

    return Math.round(result._avg.timeTakenMs ?? 0);
  }

  async getCategoryStats(userId: string, startDate?: Date, endDate?: Date) {
    const answers = await this.prisma.answer.findMany({
      where: {
        participant: { userId },
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      include: {
        question: { include: { category: true } },
      },
    });

    const statsByCategory = new Map<string, CategoryStatEntry>();

    for (const answer of answers) {
      const categoryId = answer.question.categoryId;
      const categoryName = answer.question.category.name;

      if (!statsByCategory.has(categoryId)) {
        statsByCategory.set(categoryId, { categoryName, correct: 0, total: 0 });
      }

      const stats = statsByCategory.get(categoryId)!;
      stats.total += 1;
      if (answer.isCorrect) stats.correct += 1;
    }

    return Array.from(statsByCategory.entries()).map(([categoryId, stats]) => ({
      categoryId,
      categoryName: stats.categoryName,
      correct: stats.correct,
      total: stats.total,
      successRate: Math.round((stats.correct / stats.total) * 100),
    }));
  }

  async getWinLossStats(userId: string, startDate?: Date, endDate?: Date) {
    const participations = await this.prisma.roomParticipant.findMany({
      where: {
        userId,
        room: {
          status: RoomStatus.FINISHED,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
      },
      include: {
        room: true,
      },
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const participation of participations) {
      if (participation.room.winnerParticipantId === null) {
        draws += 1;
      } else if (participation.room.winnerParticipantId === participation.id) {
        wins += 1;
      } else {
        losses += 1;
      }
    }

    return { played: participations.length, wins, losses, draws };
  }

        async getTournamentsWon(userId: string): Promise<number> {
      return this.prisma.tournament.count({
        where: {
          champion: { userId },
        },
      });
    }

  async getXp(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    return user?.xp ?? 0;
  }

  // Catalogue complet des badges avec leur statut (débloqué ou non) pour ce
  // joueur, pour permettre au front d'afficher aussi les badges verrouillés.
  async getBadges(userId: string) {
    const [allBadges, userBadges] = await Promise.all([
      this.prisma.badge.findMany(),
      this.prisma.userBadge.findMany({ where: { userId } }),
    ]);

    const earnedByBadgeId = new Map(
      userBadges.map((userBadge) => [userBadge.badgeId, userBadge.earnedAt]),
    );

    return allBadges.map((badge) => ({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      earned: earnedByBadgeId.has(badge.id),
      earnedAt: earnedByBadgeId.get(badge.id) ?? null,
    }));
  }

  async getSummary(userId: string, startDate?: Date, endDate?: Date) {
    const [gamesPlayed, answers, avgResponseTime, categories, winLoss, tournamentsWon, xp, badges] =
      await Promise.all([
        this.getGamesPlayed(userId, startDate, endDate),
        this.getAnswerStats(userId, startDate, endDate),
        this.getAverageResponseTime(userId, startDate, endDate),
        this.getCategoryStats(userId, startDate, endDate),
        this.getWinLossStats(userId, startDate, endDate),
        this.getTournamentsWon(userId),
        this.getXp(userId),
        this.getBadges(userId),
      ]);

    return { gamesPlayed, answers, avgResponseTime, categories, winLoss, tournamentsWon, xp, badges };
  }
  async getSummaryByUsername(username: string, startDate?: Date, endDate?: Date) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`Le joueur ${username} n'existe pas.`);
    }

    return this.getSummary(user.id, startDate, endDate);
  }

}
