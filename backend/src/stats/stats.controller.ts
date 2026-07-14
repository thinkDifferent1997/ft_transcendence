import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':userId/games-played')
  async getGamesPlayed(@Param('userId') userId: string) {
    const count = await this.statsService.getGamesPlayed(userId);
    return { gamesPlayed: count };
  }
  @Get(':userId/answers')
    async getAnswerStats(@Param('userId') userId: string) {
      return this.statsService.getAnswerStats(userId);
    }

   @Get(':userId/average-response-time')
    async getAverageResponseTime(@Param('userId') userId: string) {
      const avg = await this.statsService.getAverageResponseTime(userId);
      return { averageResponseTimeMs: avg };
    } 

    @Get(':userId/categories')
    async getCategoryStats(@Param('userId') userId: string) {
      return this.statsService.getCategoryStats(userId);
    }
} 