import { Controller, Post, Body } from '@nestjs/common';
import { GameResultsService } from './game-results.service';
import type { MatchStatsInput } from './dto/match-stats.interface';

@Controller('api/game-results')
export class GameResultsController {
  constructor(private readonly gameResultsService: GameResultsService) {}

}