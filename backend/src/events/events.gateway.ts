import { WebSocketServer } from "@nestjs/websockets";
import { GameManager } from "../game/game.manager";
import { Server } from "socket.io";
import { MessageBody } from "@nestjs/websockets";

/**
	* EventsGateway
* -------------
	* Porte d'entrée temps réel (WebSocket via Socket.IO).
	* Équivalent d'un contrôleur, mais pour les événements temps réel.
	* Recoit tous les evenements, laisse la logique a Game Manager et renvoies les events appropries
* aux clients
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

// -----------------------------------------------------------------------------
// Gameplay
// -----------------------------------------------------------------------------

	@SubscribeMessage("answer")
	handleAnswer(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string; answer: string | null; timeLeft: number;},
	)
	{
		const result = this.gameManager.submitAnswer(
			data.roomId,
			client,
			data.answer,
			data.timeLeft,
		);
		if (!result)
			return;

		const game = this.gameManager.getGame(data.roomId);

		if (!game)
			return;

		// Broadcast updated scores and bonus states after every answer.

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
			player1DoublePoint: result.player1DoublePoint,
			player2DoublePoint: result.player2DoublePoint,
		});

		// Send a personalized version of the next question to each player (Bonuses).

		if (result.nextQuestion)
		{
			const question = result.question!;

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

		// The match is over.
		// Send the final result to both players.

		if (result.gameOver)
		{
			this.server.to(data.roomId).emit("game_over", {
											winner: result.winner,
											player1Score: game.player1Score,
											player2Score: game.player2Score,
											player1Time: game.player1Time,
											player2Time: game.player2Time,
											});
			return ;
		}
	}

	handleConnection(client: Socket)
	{
		console.log(`${client.id} connected.`);
	}

	handleDisconnect(client: Socket)
	{
		console.log(`${client.id} disconnected.`);
	}


// -----------------------------------------------------------------------------
// Matchmaking
// -----------------------------------------------------------------------------

	// Wait until both clients have mounted the QuizPage.

	@SubscribeMessage("player_ready")
	handlePlayerReady(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	)
	{
		const ready = this.gameManager.markPlayerReady(
			data.roomId,
			client,
		);

		if (!ready)
			return;

		const game = this.gameManager.getGame(data.roomId);

		if (!game)
			return;


		game.player1.emit("game_started", {
			questions: game.questions.map(question => ({
				...question,
				answers: this.gameManager.buildDisplayedAnswers(
					question,
					false,
					false,
				),
			})),
		});

		game.player2.emit("game_started", {
			questions: game.questions.map(question => ({
				...question,
				answers: this.gameManager.buildDisplayedAnswers(
					question,
					false,
					false,
				),
			})),
		});
	}

	// Wait until both clients have received every question before starting the timers.

	@SubscribeMessage("questions_loaded")
	handleQuestionsLoaded(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string },
	)
	{
		const ready = this.gameManager.markQuestionsLoaded(
			data.roomId,
			client,
		);

		if (!ready)
			return;

		this.server.to(data.roomId).emit("start_game");
	}

	@SubscribeMessage("join_queue")
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
	}
}

