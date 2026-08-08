import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { TournamentService } from './tournament.service';
import { GameManager } from '../game/game.manager';
import { TournamentState } from './tournament.state';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TournamentGateway {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly gameManager: GameManager,
    private readonly tournamentState: TournamentState,
  ) {}
  private waitingPlayers: Socket[] = [];
  private tournamentStarting = false;

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_tournament')
  async handleJoinTournament(@ConnectedSocket() client: Socket) {
    console.log(
      'JOIN TOURNAMENT EVENT',
      client.data.username,
      new Error().stack,
    );
    if (
      this.waitingPlayers.find(
        (player) => player.data.userId === client.data.userId,
      )
    )
      return;
    if (this.tournamentStarting) return;

    this.waitingPlayers.push(client);

    this.server.emit('tournament_waiting', {
      players: this.waitingPlayers.map((player) => player.data.username),
    });

    console.log(
      `${client.data.username} joined tournament (${this.waitingPlayers.length}/4)`,
    );
    if (this.waitingPlayers.length < 4) return;

    this.tournamentStarting = true;

    const players = [...this.waitingPlayers];

    const tournamentData =
      await this.tournamentService.startFourPlayerTournament(players);

    this.tournamentState.registerTournament(
      tournamentData.tournament.id,
      tournamentData.rooms.semiFinal1.id,
      tournamentData.rooms.semiFinal2.id,
    );

    console.log('CALL registerSemiFinalPlayers #1');
    this.tournamentState.registerSemiFinalPlayers(
      tournamentData.tournament.id,
      tournamentData.rooms.semiFinal1.id,
      {
        id: players[0].data.userId,
        username: players[0].data.username,
      },
      {
        id: players[1].data.userId,
        username: players[1].data.username,
      },
    );

    console.log('CALL registerSemiFinalPlayers #2');
    this.tournamentState.registerSemiFinalPlayers(
      tournamentData.tournament.id,
      tournamentData.rooms.semiFinal2.id,
      {
        id: players[2].data.userId,
        username: players[2].data.username,
      },
      {
        id: players[3].data.userId,
        username: players[3].data.username,
      },
    );
    console.log('REGISTER SEMI ENTERED');

    await this.gameManager.createTournamentMatch(
      players[0],
      players[1],
      tournamentData.rooms.semiFinal1.id,
      tournamentData.tournament.id,
    );

    await this.gameManager.createTournamentMatch(
      players[2],
      players[3],
      tournamentData.rooms.semiFinal2.id,
      tournamentData.tournament.id,
    );

    // Les joueurs rejoignent leur room Socket.IO
    players[0].join(tournamentData.rooms.semiFinal1.id);
    players[1].join(tournamentData.rooms.semiFinal1.id);

    players[2].join(tournamentData.rooms.semiFinal2.id);
    players[3].join(tournamentData.rooms.semiFinal2.id);

    // On envoie exactement le même évènement que le matchmaking classique
    this.server.to(tournamentData.rooms.semiFinal1.id).emit('match_found', {
      roomId: tournamentData.rooms.semiFinal1.id,
      tournamentId: tournamentData.tournament.id,
      player1: {
        id: players[0].id,
        username: players[0].data.username,
      },
      player2: {
        id: players[1].id,
        username: players[1].data.username,
      },
    });

    this.server.to(tournamentData.rooms.semiFinal2.id).emit('match_found', {
      roomId: tournamentData.rooms.semiFinal2.id,
      tournamentId: tournamentData.tournament.id,
      player1: {
        id: players[2].id,
        username: players[2].data.username,
      },
      player2: {
        id: players[3].id,
        username: players[3].data.username,
      },
    });
    this.waitingPlayers = [];
    this.tournamentStarting = false;
  }

  @SubscribeMessage('leave_tournament')
  handleLeaveTournament(@ConnectedSocket() client: Socket) {
    if (this.tournamentStarting) return;

    const index = this.waitingPlayers.findIndex(
      (player) => player.data.userId === client.data.userId,
    );

    if (index === -1) return;

    this.waitingPlayers.splice(index, 1);

    this.server.emit('tournament_waiting', {
      players: this.waitingPlayers.map((player) => player.data.username),
    });

    console.log(
      `${client.data.username} left tournament (${this.waitingPlayers.length}/4)`,
    );
  }
}
