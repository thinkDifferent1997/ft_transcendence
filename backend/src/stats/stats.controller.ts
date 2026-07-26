import { Controller, Get, Param, Query, Post, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsGateway } from './stats.gateway';
import { FullAuthGuard } from '../auth/jwt/full-auth.guard';
import type { AuthenticatedRequestUser } from '../auth/jwt/jwt.strategy';

interface AuthedRequest {
  user: AuthenticatedRequestUser;
}

@Controller('api/stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly statsGateway: StatsGateway,
  ) {}

  @Get('me/summary')
  @UseGuards(FullAuthGuard)
  async getMySummary(
    @Req() req: AuthedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getSummary(
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':userId/games-played')
  async getGamesPlayed(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const count = await this.statsService.getGamesPlayed(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return { gamesPlayed: count };
  }

  @Get(':userId/answers')
  async getAnswerStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getAnswerStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':userId/average-response-time')
  async getAverageResponseTime(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const avg = await this.statsService.getAverageResponseTime(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return { averageResponseTimeMs: avg };
  }

  @Get(':userId/categories')
  async getCategoryStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getCategoryStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':userId/win-loss')
  async getWinLossStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getWinLossStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':userId/tournaments-won')
  async getTournamentsWon(@Param('userId') userId: string) {
    const count = await this.statsService.getTournamentsWon(userId);
    return { tournamentsWon: count };
  }

  @Get(':userId/summary')
  async getSummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statsService.getSummary(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post(':userId/notify-test')
  async notifyTest(@Param('userId') userId: string) {
    const summary = await this.statsService.getSummary(userId);
    this.statsGateway.notifyStatsUpdate(userId, summary);
    return { notified: true };
  }
}