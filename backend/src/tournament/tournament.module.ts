import { Module } from '@nestjs/common';
import { TournamentState } from "./tournament.state";
import { PrismaModule } from '../prisma/prisma.module';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { GameModule } from "../game/game.module";
import { TournamentGateway } from "./tournament.gateway";

@Module({
  imports: [PrismaModule, GameModule],
  controllers: [TournamentController],
  providers: [TournamentService, TournamentState],
  exports: [TournamentService, TournamentState],
})
export class TournamentModule {}
