import { Module } from '@nestjs/common';
import { TournamentState } from "./tournament.state";
import { PrismaModule } from '../prisma/prisma.module';
import { TournamentService } from './tournament.service';
import { TournamentQueue } from './tournament.queue';
import { GameModule } from "../game/game.module";
import { TournamentGateway } from "./tournament.gateway";

@Module({
  imports: [PrismaModule, GameModule],
  providers: [TournamentService, TournamentState, TournamentGateway, TournamentQueue],
  exports: [TournamentService, TournamentState, TournamentQueue],
})
export class TournamentModule {}
