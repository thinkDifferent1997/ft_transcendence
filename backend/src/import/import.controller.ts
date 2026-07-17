import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportQuestionsBatchDto } from './import-question.dto';
import { FullAuthGuard } from '../auth/jwt/full-auth.guard';

@Controller('api/import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('questions')
  @UseGuards(FullAuthGuard)
  async importQuestions(@Body() dto: ImportQuestionsBatchDto) {
    return this.importService.importQuestions(dto.questions);
  }
}