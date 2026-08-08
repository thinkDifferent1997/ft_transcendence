/**
 * EventsModule
 * ------------
 * Regroupe la gateway temps réel. Importé par AppModule.
 */
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { GameModule } from '../game/game.module';
import { JwtAuthModule } from '../auth/jwt/jwt-auth.module';
import { TournamentModule } from '../tournament/tournament.module';
import { GameResultsModule } from '../game-results/game-results.module';
import { GamificationModule } from '../gamification/gamification.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [
    GameModule,
    JwtAuthModule,
    TournamentModule,
    GameResultsModule,
    GamificationModule,
    StatsModule,
  ],
  providers: [EventsGateway],
})
export class EventsModule {}
