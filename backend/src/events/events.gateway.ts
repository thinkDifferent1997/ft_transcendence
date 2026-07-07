import { WebSocketServer } from "@nestjs/websockets";
import { GameManager } from "../game/game.manager";
import { Server } from "socket.io";
import { MessageBody } from "@nestjs/websockets";

/**
	* EventsGateway
* -------------
	* Porte d'entrée temps réel (WebSocket via Socket.IO).
	* Équivalent d'un contrôleur, mais pour les événements temps réel.
	* Pour l'instant : un simple ping/pong pour valider la connexion
* de bout en bout (front -> nginx -> backend).
	*/
import {
	WebSocketGateway,
	SubscribeMessage,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
	path: '/ws',
	cors: {
		origin: '*', //to be changed to later by our domain name. * allows everything
		credentials: true,
	},
})

export class EventsGateway 
implements OnGatewayConnection, OnGatewayDisconnect{

	constructor(
    private readonly gameManager: GameManager,
	) {}

	@WebSocketServer()
	server: Server;
	
	@SubscribeMessage("answer")
	handleAnswer(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string; answer: string },
	)
	{
		console.log("Answer received for room:", data.roomId);
		const result = this.gameManager.submitAnswer(
			data.roomId,
			client,
			data.answer,
		);
		if (!result)
			return;
		console.log("Sending player answered");
		console.log({
			player1Streak: result.player1Streak,
			player2Streak: result.player2Streak,
		});
		this.server.to(data.roomId).emit("player_answered", {
		    playerId: client.id,
			correct: result.correct,
			player1Score: result.player1Score,
			player2Score: result.player2Score,
			player1Streak: result.player1Streak,
			player2Streak: result.player2Streak,
			player1ThreeChoice: result.player1ThreeChoice,
			player2ThreeChoice: result.player2ThreeChoice,
			player1HideAnswer: result.player1HideAnswer,
			player2HideAnswer: result.player2HideAnswer,
		//	player1HiddenAnswer: result.player1HiddenAnswer,
		//	player2HiddenAnswer: result.player2HiddenAnswer,
			player1DoublePoint: result.player1DoublePoint,
			player2DoublePoint: result.player2DoublePoint,
		});


		if (result.nextQuestion)
		{
			const game = this.gameManager.getGame(data.roomId);
			const question = result.question!;

			if (!game)
				return;

			game.player1.emit("next_question", {
				question: {
					...question,
					answers: this.gameManager.buildDisplayedAnswers(
						question,
						result.player1ThreeChoice ?? false,
						result.player2HideAnswer ?? false,
					),
				},
				questionIndex: result.questionIndex,
			});

			game.player2.emit("next_question", {
				question: {
					...question,
					answers: this.gameManager.buildDisplayedAnswers(
						question,
						result.player2ThreeChoice ?? false,
						result.player1HideAnswer ?? false,
					),
				},
				questionIndex: result.questionIndex,
			});
		}

		if (result.gameOver)
			this.server.to(data.roomId).emit("game_over");
	}

	handleConnection(client: Socket)
	{
		console.log(`${client.id} connected.`);
	}

	handleDisconnect(client: Socket)
	{
		console.log(`${client.id} disconnected.`);
	}

	@SubscribeMessage("ping")
	handlePing(@ConnectedSocket() client: Socket): string {
		console.log(`ping reçu de ${client.id}`);
		return 'pong';
	}

	@SubscribeMessage("join_queue")

//-----------------------
//MATCHMAKING
//-----------------------

	async handleJoinQueue(
	@ConnectedSocket() client: Socket,
	)
	{
		const game = await this.gameManager.createMatch(client);

		if (!game)
		{
			console.log(`${client.id} is waiting.`);
			return;
		}

		game.player1.join(game.roomId);
		game.player2.join(game.roomId);

		console.log(
			`${game.player1.id} matched with ${game.player2.id}`,
		);

		this.server.to(game.roomId).emit("match_found", {
			roomId: game.roomId,
			player1Id: game.player1.id,
    		player2Id: game.player2.id,
		});
		game.player1.emit("game_started", {
			questions: [
				{
					...game.questions[0],
					answers: this.gameManager.buildDisplayedAnswers(
						game.questions[0],
						false,
						false,
					),
				},
			],
		});
		game.player2.emit("game_started", {
			questions: [
				{
					...game.questions[0],
					answers: this.gameManager.buildDisplayedAnswers(
						game.questions[0],
						false,
						false,
					),
				},
			],
		});
	}
}
