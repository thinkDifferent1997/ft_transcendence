import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { TournamentService } from "./tournament.service";
import { GameManager } from "../game/game.manager";

@WebSocketGateway({
	path: "/ws",
	cors: {
		origin: "*",
		credentials: true,
	},
})

export class TournamentGateway
{
	constructor(
		private readonly tournamentService: TournamentService,
		private readonly gameManager: GameManager,
	) {}
	private waitingPlayers: Socket[] = [];

	@WebSocketServer()
	server: Server;

	@SubscribeMessage("join_tournament")
	async handleJoinTournament(
		@ConnectedSocket() client: Socket,
	)
	{
		if (this.waitingPlayers.find(player => player.data.userId === client.data.userId))
			return;

		this.waitingPlayers.push(client);

		this.server.emit("tournament_waiting", {
			players: this.waitingPlayers.length,
		});

		console.log(
			`${client.data.username} joined tournament (${this.waitingPlayers.length}/4)`
		);
		if (this.waitingPlayers.length < 4)
			return;
		const players = [...this.waitingPlayers];
		this.waitingPlayers = [];

		const tournament =
	await this.tournamentService.startFourPlayerTournament(players);

	await this.gameManager.createTournamentMatch(
		players[0],
		players[1],
		tournament.rooms.semiFinal1.id,
		tournamentId,
	);

	await this.gameManager.createTournamentMatch(
		players[2],
		players[3],
		tournament.rooms.semiFinal2.id,
		tournamentId,
	);

	// Les joueurs rejoignent leur room Socket.IO
	players[0].join(tournament.rooms.semiFinal1.id);
	players[1].join(tournament.rooms.semiFinal1.id);

	players[2].join(tournament.rooms.semiFinal2.id);
	players[3].join(tournament.rooms.semiFinal2.id);

	// On envoie exactement le même évènement que le matchmaking classique
	this.server.to(tournament.rooms.semiFinal1.id).emit("match_found", {
		roomId: tournament.rooms.semiFinal1.id,
		player1: {
			id: players[0].id,
			username: players[0].data.username,
		},
		player2: {
			id: players[1].id,
			username: players[1].data.username,
		},
	});

	this.server.to(tournament.rooms.semiFinal2.id).emit("match_found", {
		roomId: tournament.rooms.semiFinal2.id,
		player1: {
			id: players[2].id,
			username: players[2].data.username,
		},
		player2: {
			id: players[3].id,
			username: players[3].data.username,
		},
	});

	console.log("Tournament started");
	}
}
