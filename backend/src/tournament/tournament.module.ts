import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { GameModule } from "../game/game.module";
import { TournamentGateway } from "./tournament.gateway";

@Module({
  imports: [PrismaModule, GameModule],
  controllers: [TournamentController],
  providers: [TournamentService, TournamentGateway],
  exports: [TournamentService],
})
export class TournamentModule {}
