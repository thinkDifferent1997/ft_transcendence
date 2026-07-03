import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TournamentModule } from './tournament/tournament.module'

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, TournamentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
