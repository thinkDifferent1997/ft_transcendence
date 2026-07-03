import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {}