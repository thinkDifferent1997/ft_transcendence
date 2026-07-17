import { Injectable } from '@nestjs/common';
import { RoomMode, RoomStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchStatsInput } from './dto/match-stats.interface';

const DEFAULT_TIME_TAKEN_MS = 0;

@Injectable()
export class GameResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordMatch(stats: MatchStatsInput) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          mode: RoomMode.DUEL,
          status: RoomStatus.FINISHED,
        },
      });

      const participant1 = await tx.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: stats.player1Id,
          score: stats.player1Score,
        },
      });

      const participant2 = await tx.roomParticipant.create({
        data: {
          roomId: room.id,
          userId: stats.player2Id,
          score: stats.player2Score,
        },
      });

      for (const q of stats.questions) {
        let category = await tx.category.findFirst({
          where: { name: q.category },
        });
        if (!category) {
          category = await tx.category.create({
            data: { name: q.category },
          });
        }

        let question = await tx.question.findFirst({
          where: { text: q.question, categoryId: category.id },
        });
        if (!question) {
          question = await tx.question.create({
            data: {
              text: q.question,
              categoryId: category.id,
            },
          });
        }

        await tx.answer.create({
          data: {
            isCorrect: q.player1Correct,
            timeTakenMs: DEFAULT_TIME_TAKEN_MS,
            participantId: participant1.id,
            questionId: question.id,
          },
        });

        await tx.answer.create({
          data: {
            isCorrect: q.player2Correct,
            timeTakenMs: DEFAULT_TIME_TAKEN_MS,
            participantId: participant2.id,
            questionId: question.id,
          },
        });
      }

      return { roomId: room.id, participant1Id: participant1.id, participant2Id: participant2.id };
    });
  }
}