import { Module } from '@nestjs/common';
import { TournamentState } from "./tournament.state";
import { PrismaModule } from '../prisma/prisma.module';
import { TournamentService } from './tournament.service';
import { GameModule } from "../game/game.module";
import { TournamentGateway } from "./tournament.gateway";

@Module({
  imports: [PrismaModule, GameModule],
  providers: [TournamentService, TournamentGateway, TournamentState],
  exports: [TournamentService, TournamentState],
})
export class TournamentModule {}
