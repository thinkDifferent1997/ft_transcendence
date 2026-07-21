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
			await this.tournamentService.createFourPlayerTournament();

		console.log("Tournament created :", tournament.tournament.id);

		console.log(
			"Semi 1 :",
			tournament.rooms.semiFinal1.id,
		);

		console.log(
			"Semi 2 :",
			tournament.rooms.semiFinal2.id,
		);

		console.log(
			"Final :",
			tournament.rooms.finalRoom.id,
		);
	}
}
