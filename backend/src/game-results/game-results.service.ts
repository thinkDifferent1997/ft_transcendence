import { Injectable } from '@nestjs/common';
import { Prisma, RoomMode, RoomStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  MatchStatsInput,
  QuestionHistoryInput,
} from './dto/match-stats.interface';

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

      // stats.winner tient déjà compte du départage par le temps en cas
      // d'égalité de score (voir GameManager.submitAnswer) : on le persiste
      // tel quel plutôt que de le redéduire des scores plus tard.
      const winnerParticipantId =
        stats.winner === 1
          ? participant1.id
          : stats.winner === 2
            ? participant2.id
            : null;

      await tx.room.update({
        where: { id: room.id },
        data: { winnerParticipantId },
      });

      await this.insertAnswers(
        tx,
        participant1.id,
        participant2.id,
        stats.questions,
      );

      return {
        roomId: room.id,
        participant1Id: participant1.id,
        participant2Id: participant2.id,
      };
    });
  }

  // Enregistre les réponses d'un match de tournoi (semi-finale ou finale) :
  // contrairement à recordMatch, la room et ses participants existent déjà
  // (créés au démarrage du tournoi), on ne fait qu'ajouter les réponses.
  async recordAnswersForRoom(
    participant1Id: string,
    participant2Id: string,
    questions: QuestionHistoryInput[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.insertAnswers(tx, participant1Id, participant2Id, questions);
    });
  }

  private async insertAnswers(
    tx: Prisma.TransactionClient,
    participant1Id: string,
    participant2Id: string,
    questions: QuestionHistoryInput[],
  ) {
    for (const q of questions) {
      const category = await this.upsertCategory(tx, q.category);
      const question = await this.upsertQuestion(tx, category.id, q.question);

      await tx.answer.create({
        data: {
          isCorrect: q.player1Correct,
          timeTakenMs: DEFAULT_TIME_TAKEN_MS,
          participantId: participant1Id,
          questionId: question.id,
        },
      });

      await tx.answer.create({
        data: {
          isCorrect: q.player2Correct,
          timeTakenMs: DEFAULT_TIME_TAKEN_MS,
          participantId: participant2Id,
          questionId: question.id,
        },
      });
    }
  }

  private async upsertCategory(tx: Prisma.TransactionClient, name: string) {
    return tx.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  private async upsertQuestion(
    tx: Prisma.TransactionClient,
    categoryId: string,
    text: string,
  ) {
    const existing = await tx.question.findFirst({
      where: { text, categoryId },
    });

    if (existing) return existing;

    return tx.question.create({ data: { text, categoryId } });
  }
}
