import { Injectable } from '@nestjs/common';
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

  async getGamesPlayed(userId: string): Promise<number> {
    return this.prisma.roomParticipant.count({
      where: {
        userId,
        room: {
          status: RoomStatus.FINISHED,
        },
      },
    });
  }

  async getAnswerStats(userId: string) {
  const results = await this.prisma.answer.groupBy({
    by: ['isCorrect'],
    where: {
      participant: { userId },
    },
    _count: {
      _all: true,
    },
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

    async getAverageResponseTime(userId: string): Promise<number> {
      const result = await this.prisma.answer.aggregate({
        where: {
          participant: { userId },
        },
        _avg: {
          timeTakenMs: true,
        },
      });

      return Math.round(result._avg.timeTakenMs ?? 0);
    }

async getCategoryStats(userId: string) {
  const answers = await this.prisma.answer.findMany({
    where: {
      participant: { userId },
    },
    include: {
      question: {
        include: {
          category: true,
        },
      },
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
}