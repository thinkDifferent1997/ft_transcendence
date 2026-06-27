import { Module } from '@nestjs/common';
import { TriviaModule } from "./trivia/trivia.module";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, TriviaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
