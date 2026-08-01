import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StatsModule } from '../stats/stats.module';
import { GamificationService } from './gamification.service';

@Module({
  imports: [PrismaModule, StatsModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
