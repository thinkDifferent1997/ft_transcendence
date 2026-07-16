import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TournamentModule } from './tournament/tournament.module'
import { StatsModule } from './stats/stats.module';
import { ExportModule } from './export/export.module';
import { ImportModule } from './import/import.module';


@Module({
  imports: [PrismaModule, AuthModule, EventsModule, TournamentModule, StatsModule, ExportModule, ImportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
