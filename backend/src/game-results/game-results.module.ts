import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GameResultsService } from './game-results.service';
import { GameResultsController} from './game-results.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GameResultsController],
  providers: [GameResultsService],
  exports: [GameResultsService],
})
export class GameResultsModule {}