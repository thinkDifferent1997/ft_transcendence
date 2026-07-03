import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { TournamentService } from './tournament.service';

@Controller('api/tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  /**
   * Create a new 4-player tournament with semi-final and final rooms
   */
  @Post()
  @HttpCode(201)
  async create() {
    return this.tournamentService.createFourPlayerTournament();
  }

  /**
   * Create a new 8-player tournament with semi-final and final rooms
   */
  @Post('eight-players')
  @HttpCode(201)
  async createEightPlayerTournament() {
    return this.tournamentService.createEightPlayerTournament();
  }

  /**
   * Report the winner of a room and advance them to the next round
   */
  @Post(':tournamentId/report-winner')
  @HttpCode(200)
  async reportWinner(
    @Param('tournamentId') tournamentId: string,
    @Body('roomId') roomId: string,
    @Body('winnerParticipantId') winnerParticipantId: string,
  ) {
    return this.tournamentService.reportRoomWinner(roomId, winnerParticipantId);
  }

  /**
   * Add a participant to a room
   */
  @Post(':roomId/participants')
  @HttpCode(201)
  async addParticipant(
    @Param('roomId') roomId: string,
    @Body('userId') userId?: string,
    @Body('isBot') isBot: boolean = false,
  ) {
    return this.tournamentService.addParticipantToRoom(roomId, userId, isBot);
  }

  /**
   * Add multiple participants to a room (useful for testing)
   */
  @Post(':roomId/participants/batch')
  @HttpCode(201)
  async addMultipleParticipants(
    @Param('roomId') roomId: string,
    @Body('participants') participants: Array<{ userId?: string; isBot?: boolean }>,
  ) {
    return this.tournamentService.addMultipleParticipantsToRoom(roomId, participants);
  }

  /**
   * Get tournament details
   */
  @Get(':tournamentId')
  async getTournament(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournamentById(tournamentId);
  }

  /**
   * Get all rooms in a tournament
   */
  @Get(':tournamentId/rooms')
  async getTournamentRooms(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournamentRooms(tournamentId);
  }

  /**
   * Get room details with participants
   */
  @Get('rooms/:roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.tournamentService.getRoomById(roomId);
  }

  /**
   * Get participants in a room
   */
  @Get('rooms/:roomId/participants')
  async getRoomParticipants(@Param('roomId') roomId: string) {
    return this.tournamentService.getRoomParticipants(roomId);
  }

  /**
   * Seed questions (temporary - for testing)
   */
  @Post('seed/questions')
  @HttpCode(201)
  async seedQuestions() {
    const categories = [
      { name: 'General Knowledge' },
      { name: 'Science' },
      { name: 'History' },
    ];

    const questions = [
      { text: 'What is the capital of France?', choices: ['Paris', 'London', 'Berlin', 'Madrid'], correct: 0 },
      { text: 'What is 2+2?', choices: ['3', '4', '5', '6'], correct: 1 },
      { text: 'What is the largest planet?', choices: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correct: 2 },
      // plus de questions...
    ];

    return this.tournamentService.seedQuestions(questions);
  }
}