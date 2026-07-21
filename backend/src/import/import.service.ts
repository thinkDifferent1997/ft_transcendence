import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImportQuestionDto } from './dto/import-question.dto';

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importQuestions(questions: ImportQuestionDto[]) {
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const q of questions) {
      const hasCorrectAnswer = q.choices.some((c) => c.isCorrect);
      if (!hasCorrectAnswer) {
        results.skipped += 1;
        results.errors.push(`"${q.text}" : aucun choix marqué correct.`);
        continue;
      }

      let category = await this.prisma.category.findFirst({
        where: { name: q.category },
      });
      if (!category) {
        category = await this.prisma.category.create({
          data: { name: q.category },
        });
      }

      await this.prisma.question.create({
        data: {
          text: q.text,
          categoryId: category.id,
          choices: {
            create: q.choices.map((c) => ({
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          },
        },
      });

      results.imported += 1;
    }

    return results;
  }
}