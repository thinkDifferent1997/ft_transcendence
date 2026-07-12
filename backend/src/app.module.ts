import { Module } from '@nestjs/common';
import { TriviaModule } from "./trivia/trivia.module";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { GameModule } from "./game/game.module";
import { TournamentModule } from './tournament/tournament.module'

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, TriviaModule, GameModule, TournamentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
