import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument = require('pdfkit');
import type { Response } from 'express';

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

  async exportUserDataAsCsv(userId: string): Promise<string> {
    const participations = await this.prisma.roomParticipant.findMany({
      where: { userId },
      include: {
        room: { select: { mode: true, status: true, createdAt: true } },
        answers: {
          include: { question: { select: { text: true } } },
        },
      },
    });

    const header =
      'room_mode,room_status,question,is_correct,time_taken_ms,answered_at';
    const rows: string[] = [header];

    for (const participation of participations) {
      for (const answer of participation.answers) {
        const escapedQuestion = `"${answer.question.text.replace(/"/g, '""')}"`;
        rows.push(
          [
            participation.room.mode,
            participation.room.status,
            escapedQuestion,
            answer.isCorrect,
            answer.timeTakenMs,
            answer.createdAt.toISOString(),
          ].join(','),
        );
      }
    }

    return rows.join('\n');
  }

  async exportUserDataAsPdf(userId: string, res: Response): Promise<void> {
    const data = await this.exportUserData(userId);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Personal Data Export', { align: 'center' });
    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Generated on : ${new Date(data.exportedAt).toLocaleString('fr-FR')}`,
      );
    doc.moveDown();

    doc.fontSize(16).text('Profile');
    doc.fontSize(12);
    doc.text(`Username : ${data.user?.username ?? '-'}`);
    doc.text(`Email : ${data.user?.email ?? '-'}`);
    doc.text(
      `Since : ${data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString('fr-FR') : '-'}`,
    );
    doc.moveDown();

    doc.fontSize(16).text('Games played');
    doc.fontSize(12);
    for (const p of data.participations) {
      doc.text(
        `- Mode ${p.room.mode}, status ${p.room.status}, score ${p.score}`,
      );
    }
    doc.moveDown();

    doc.fontSize(16).text('Tournaments won');
    doc.fontSize(12);
    if (data.tournamentsWon.length === 0) {
      doc.text('No tournament won.');
    } else {
      for (const t of data.tournamentsWon) {
        doc.text(
          `- Tournament won on ${new Date(t.createdAt).toLocaleDateString('fr-FR')}`,
        );
      }
    }

    doc.end();
  }
}
