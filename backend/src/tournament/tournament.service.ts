import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoomMode, RoomStatus, TournamentRound } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

	async startFourPlayerTournament(players: any[]) {
		const tournament = await this.createFourPlayerTournament();

		await this.addParticipantToRoom(
			tournament.rooms.semiFinal1.id,
			players[0].data.userId,
		);

		await this.addParticipantToRoom(
			tournament.rooms.semiFinal1.id,
			players[1].data.userId,
		);

		await this.addParticipantToRoom(
			tournament.rooms.semiFinal2.id,
			players[2].data.userId,
		);

		await this.addParticipantToRoom(
			tournament.rooms.semiFinal2.id,
			players[3].data.userId,
		);

		return tournament;
	}

   async createFourPlayerTournament() {
    return this.prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.create({
        data: {
          status: RoomStatus.WAITING,
        },
      });

      const finalRoom = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.FINAL,
          tournamentId: tournament.id,
        },
      });

      const semiFinal1 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.SEMI_FINAL,
          tournamentId: tournament.id,
          nextRoomId: finalRoom.id,
        },
      });

      const semiFinal2 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.SEMI_FINAL,
          tournamentId: tournament.id,
          nextRoomId: finalRoom.id,
        },
      });

      // Assigner les questions à chaque room (dans la transaction)
      await this.assignQuestionsToRoomTx(tx, semiFinal1.id, 10);
      await this.assignQuestionsToRoomTx(tx, semiFinal2.id, 10);
      await this.assignQuestionsToRoomTx(tx, finalRoom.id, 10);

      return {
        tournament,
        rooms: {
          semiFinal1,
          semiFinal2,
          finalRoom,
        },
      };
    });
  }

  async assignQuestionsToRoomTx(tx: any, roomId: string, questionCount: number = 10) {
    const questions = await tx.question.findMany({
      take: questionCount,
    });

  return Promise.all(
    questions.map((question, index) =>
      tx.roomQuestion.create({
        data: {
          roomId,
          questionId: question.id,
          order: index + 1,
        },
      }),
    ),
  );
  }

  async reportRoomWinner(roomId: string, winnerParticipantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: {
          participants: true,
          tournament: true,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found.');
      }

      const winner = room.participants.find(
        (participant) => participant.id === winnerParticipantId,
      );

      if (!winner) {
        throw new BadRequestException(
          'Winner must be one of the participants of this room.',
        );
      }

      await tx.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.FINISHED,
        },
      });

      if (!room.nextRoomId) {
        if (!room.tournamentId) {
          throw new BadRequestException('Tournament room has no tournament.');
        }

        await tx.tournament.update({
          where: { id: room.tournamentId },
          data: {
            championId: winner.id,
            status: RoomStatus.FINISHED,
          },
        });

        return {
          tournamentFinished: true,
          championParticipantId: winner.id,
        };
      }

      const nextRoom = await tx.room.findUnique({
        where: { id: room.nextRoomId },
        include: {
          participants: true,
        },
      });

      if (!nextRoom) {
        throw new NotFoundException('Next room not found.');
      }

      const alreadyJoined = nextRoom.participants.some((participant) => {
        if (winner.userId === null) {
          return participant.userId === null && participant.isBot === winner.isBot;
        }

        return participant.userId === winner.userId;
      });

      if (!alreadyJoined) {
        await tx.roomParticipant.create({
          data: {
            roomId: nextRoom.id,
            userId: winner.userId,
            isBot: winner.isBot,
            score: 0,
          },
        });
      }

      const nextRoomParticipantCount = await tx.roomParticipant.count({
        where: { roomId: nextRoom.id },
      });

      if (nextRoomParticipantCount >= 2) {
        await tx.room.update({
          where: { id: nextRoom.id },
          data: {
            status: RoomStatus.IN_PROGRESS,
          },
        });
      }

      return {
        tournamentFinished: false,
        nextRoomId: nextRoom.id,
      };
    });
  }

  async addParticipantToRoom(
    roomId: string,
    userId?: string,
    isBot: boolean = false,
  ) {
    return this.prisma.roomParticipant.create({
      data: {
        roomId,
        userId: userId || null,
        isBot,
        score: 0,
      },
    });
  }

  private async addMultipleParticipantsToRoomTx(
		tx: Prisma.TransactionClient,
		roomId: string,
		participants: Array<{ userId?: string; isBot?: boolean }>,
	) {
		await Promise.all(
			participants.map((p) =>
				tx.roomParticipant.create({
					data: {
						roomId,
						userId: p.userId ?? null,
						isBot: p.isBot ?? false,
						score: 0,
					},
				}),
			),
		);
	}

  async addMultipleParticipantsToRoom(
    roomId: string,
    participants: Array<{ userId?: string; isBot?: boolean }>,
  ) {
    return Promise.all(
      participants.map((p) =>
        this.addParticipantToRoom(roomId, p.userId, p.isBot ?? false),
      ),
    );
  }

  async getTournamentById(tournamentId: string) {
    return this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        rooms: true,
        champion: true,
      },
    });
  }

  async getTournamentRooms(tournamentId: string) {
    return this.prisma.room.findMany({
      where: { tournamentId },
      include: {
        participants: true,
        questions: true,
      },
    });
  }

  async getRoomById(roomId: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        questions: true,
        tournament: true,
      },
    });
  }

  async getRoomParticipants(roomId: string) {
    return this.prisma.roomParticipant.findMany({
      where: { roomId },
      include: {
        user: true,
        answers: true,
      },
    });
  }

  async assignQuestionsToRoom(roomId: string, questionCount: number = 10) {
    // Récupérer des questions aléatoires de la base de données
    const questions = await this.prisma.question.findMany({
      take: questionCount,
      // Pour vraiment du random, utiliser ORDER BY RANDOM()
      // mais Prisma ne le supporte pas directement, donc on prend les N premières
    });

    // Assigner les questions à la room avec un ordre
    const roomQuestions = await Promise.all(
      questions.map((question, index) =>
        this.prisma.roomQuestion.create({
          data: {
            roomId,
            questionId: question.id,
            order: index + 1,
          },
        }),
      ),
    );

    return roomQuestions;
  }

  async seedQuestions(questionsData: any[]) {
    // Créer ou récupérer une catégorie par défaut
    let category = await this.prisma.category.findFirst({
      where: { name: 'General' },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'General' },
      });
    }

    // Créer les questions
    return Promise.all(
      questionsData.map((q) =>
        this.prisma.question.create({
          data: {
            text: q.text,
            categoryId: category.id,
            choices: {
              create: q.choices.map((choice: string, index: number) => ({
                text: choice,
                isCorrect: index === q.correct,
              })),
            },
          },
          include: { choices: true },
        }),
      ),
    );
  }

  async createEightPlayerTournament() {
    return this.prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.create({
        data: {
          status: RoomStatus.WAITING,
        },
      });

      // Créer la finale
      const finalRoom = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.FINAL,
          tournamentId: tournament.id,
        },
      });

      // Créer 2 semi-finals qui pointent vers la finale
      const semiFinal1 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.SEMI_FINAL,
          tournamentId: tournament.id,
          nextRoomId: finalRoom.id,
        },
      });

      const semiFinal2 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.SEMI_FINAL,
          tournamentId: tournament.id,
          nextRoomId: finalRoom.id,
        },
      });

      // Créer 4 quarts de finales qui pointent vers les semi-finals
      const quarterFinal1 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.QUARTER_FINAL,
          tournamentId: tournament.id,
          nextRoomId: semiFinal1.id,
        },
      });

      const quarterFinal2 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.QUARTER_FINAL,
          tournamentId: tournament.id,
          nextRoomId: semiFinal1.id,
        },
      });

      const quarterFinal3 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.QUARTER_FINAL,
          tournamentId: tournament.id,
          nextRoomId: semiFinal2.id,
        },
      });

      const quarterFinal4 = await tx.room.create({
        data: {
          mode: RoomMode.TOURNAMENT,
          status: RoomStatus.WAITING,
          round: TournamentRound.QUARTER_FINAL,
          tournamentId: tournament.id,
          nextRoomId: semiFinal2.id,
        },
      });

      // Assigner les questions
      await this.assignQuestionsToRoomTx(tx, quarterFinal1.id, 10);
      await this.assignQuestionsToRoomTx(tx, quarterFinal2.id, 10);
      await this.assignQuestionsToRoomTx(tx, quarterFinal3.id, 10);
      await this.assignQuestionsToRoomTx(tx, quarterFinal4.id, 10);
      await this.assignQuestionsToRoomTx(tx, semiFinal1.id, 10);
      await this.assignQuestionsToRoomTx(tx, semiFinal2.id, 10);
      await this.assignQuestionsToRoomTx(tx, finalRoom.id, 10);

      return {
        tournament,
        rooms: {
          quarterFinals: [quarterFinal1, quarterFinal2, quarterFinal3, quarterFinal4],
          semiFinals: [semiFinal1, semiFinal2],
          finalRoom,
        },
      };
    });
  }
}
