import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    const participations = await this.prisma.roomParticipant.findMany({
      where: { userId },
      include: {
        room: {
          select: { id: true, mode: true, status: true, createdAt: true },
        },
        answers: {
          select: {
            isCorrect: true,
            timeTakenMs: true,
            createdAt: true,
            question: { select: { text: true } },
          },
        },
      },
    });

    const tournamentsWon = await this.prisma.tournament.findMany({
      where: { champion: { userId } },
      select: { id: true, createdAt: true },
    });

    return {
      exportedAt: new Date().toISOString(),
      user,
      participations,
      tournamentsWon,
    };
  }
}