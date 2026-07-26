import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { StatsGateway } from './stats.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [StatsService, StatsGateway],
  exports: [StatsService],
})
export class StatsModule {}