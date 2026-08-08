import { Controller } from '@nestjs/common';
import { GameResultsService } from './game-results.service';

@Controller('game-results')
export class GameResultsController {
  constructor(private readonly gameResultsService: GameResultsService) {}
}
