import { WebSocketServer } from "@nestjs/websockets";
import { GameManager } from "../game/game.manager";
import { Server } from "socket.io";
import { MessageBody } from "@nestjs/websockets";
import { JwtService } from '@nestjs/jwt';
import { parse } from "cookie";
import { TournamentService } from "../tournament/tournament.service";
import { GameSession } from "../game/game.session";
import { TournamentState } from "../tournament/tournament.state";

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
	private readonly jwtService: JwtService,
	private readonly tournamentService: TournamentService,
	private readonly tournamentState: TournamentState,
	) {}

	@WebSocketServer()
	server: Server;


// -----------------------------------------------------------------------------
// Gameplay
// -----------------------------------------------------------------------------

	@SubscribeMessage("answer")
	async handleAnswer(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { roomId: string; answer: string | null; timeLeft: number;},
	)
	{
		await this.processAnswer(
			client,
			data.roomId,
			data.answer,
			data.timeLeft,
		);
	}

	private async processAnswer(
		client: Socket | "AI",
		roomId: string,
		answer: string | null,
		timeLeft: number,
	)
	{
		const result = this.gameManager.submitAnswer(
			roomId,
			client,
			answer,
			timeLeft,
		);

		if (!result)
			return;

		const game = this.gameManager.getGame(roomId);

		if (!game)
			return;

		if (game && game.ai && client !== "AI" && !result.nextQuestion && !game.player2Answered && timeLeft > 5)
		   	this.accelerateAITurn(roomId);
	
		// Broadcast updated scores and bonus states after every answer.

		this.server.to(roomId).emit("player_answered", {
		    playerId: client === "AI" ? "AI" : client.id,
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

			if (!game.ai)
			{
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
			if (game.ai)
				this.startAITurn(game.roomId);
		}

		// The match is over.
		// Send the final result to both players.

		if (result.gameOver)
		{
			if (!game.tournamentId)
			{
				this.server.to(roomId).emit("game_over", {
					winner: result.winner,
					player1Score: game.player1Score,
					player2Score: game.player2Score,
					player1Time: game.player1Time,
					player2Time: game.player2Time,
				});

				this.gameManager.removeGame(roomId);
				return;
			}
			else if (game.tournamentId)
			{
				const winnerSocket =
					result.winner === 1
						? game.player1
						: game.player2;

				const loserSocket =
					result.winner === 1
						? game.player2
						: game.player1;

				await this.finishTournamentMatch(
					game,
					winnerSocket,
					loserSocket,
				);
				return;
			}
		}
	}

	private random(min: number, max: number): number
	{
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private startAITurn(roomId: string)
	{
		const game = this.gameManager.getGame(roomId);

		if (!game || !game.ai)
			return;

		if (game.ai.timeout)
			clearTimeout(game.ai.timeout);

		const question = game.questions[game.currentQuestion];
		let accuracy: number;
		let delay: number;

		switch (question.difficulty)
		{
			case "easy":
				accuracy = 0.80;
				delay = this.random(4000, 14000);
				break;

			case "normal":
				accuracy = 0.55;
				delay = this.random(8000, 16000);
				break;

			case "hard":
				accuracy = 0.30;
				delay = this.random(10000, 18000);
				break;

			default:
				accuracy = 0.55;
				delay = this.random(8000, 16000);
		}
	game.ai.accuracy = accuracy;
	game.ai.answerAt = Date.now() + delay;

	game.ai.timeout = setTimeout(() =>
	{
		this.aiAnswer(roomId);
	}, delay);
	}

	private async aiAnswer(roomId: string)
	{
		const game = this.gameManager.getGame(roomId);

		if (!game || !game.ai)
			return;

		const question = game.questions[game.currentQuestion];

		const success = Math.random() < game.ai.accuracy!;

		let answer: string;

		if (success)
		{
			answer = question.correct;
		}
		else
		{
			const wrongAnswers = question.answers.filter(
				a => a !== question.correct,
			);

			answer = wrongAnswers[
				this.random(0, wrongAnswers.length - 1)
			];
		}

		await this.processAnswer(
			"AI",
			roomId,
			answer,
			10, // on améliorera ça plus tard
		);
	}

	private accelerateAITurn(roomId: string)
	{
		const game = this.gameManager.getGame(roomId);

		if (!game || !game.ai)
			return;

		if (!game.ai.timeout || !game.ai.answerAt)
			return;

		const remaining = game.ai.answerAt - Date.now();

		// Déjà prévu dans moins de 3 secondes
		if (remaining <= 3000)
			return;
		//console.log("before clear timeout : " game.ai.timeout);
		clearTimeout(game.ai.timeout);
		//console.log("clear timeout : " game.ai.timeout);

		game.ai.answerAt = Date.now() + 3000;

		game.ai.timeout = setTimeout(() =>
		{
			this.aiAnswer(roomId);
		}, 3000);
	}

	private emitGameOver(socket: Socket, result: any, game: GameSession)
	{
		socket.emit("game_over", {
			winner: result.winner,
			player1Score: game.player1Score,
			player2Score: game.player2Score,
			player1Time: game.player1Time,
			player2Time: game.player2Time,
		});
	}

	private async finishTournamentMatch(
		game: GameSession,
		winnerSocket: Socket,
		loserSocket: Socket,
	)
	{
		const tournamentResult =
			await this.tournamentService.reportWinnerFromUser(
				game.roomId,
				winnerSocket.data.userId,
			);

		const tournament =
			this.tournamentState.findTournamentBySemiFinal(game.roomId);

		if (tournament)
		{
			this.tournamentState.setSemiFinalWinner(
				tournament.tournamentId,
				game.roomId,
				winnerSocket.data.userId,
			);
		}

		if (!tournamentResult.tournamentFinished)
		{
			// Si l'autre finaliste a déjà quitté le tournoi avant que la
			// finale ne démarre, ce vainqueur devient champion directement :
			// sans ça, il resterait bloqué sur "Waiting for your opponent...".
			const forfeitedUserId =
				this.tournamentState.consumeFinalForfeit(game.tournamentId!);

			if (forfeitedUserId)
			{
				await this.tournamentService.reportWinnerFromUser(
					tournamentResult.nextRoomId!,
					winnerSocket.data.userId,
				);

				winnerSocket.emit("tournament_champion", {
					reason: "forfeit",
				});

				this.emitGameOver(loserSocket, {
					winner:
						winnerSocket === game.player1
							? 1
							: 2,
				}, game);

				this.gameManager.removeGame(game.roomId);
				return;
			}

			if (tournamentResult.readyToStart)
			{
				const bracket =
					this.tournamentState.getBracket(game.tournamentId!);

				console.log("Sending bracket:", bracket);

				const participants =
					await this.tournamentService.getRoomParticipants(
						tournamentResult.nextRoomId,
					);

				const socket1 =
					this.gameManager.getPlayerSocket(
						participants[0].userId!,
					);

				const socket2 =
					this.gameManager.getPlayerSocket(
						participants[1].userId!,
					);

				if (!socket1 || !socket2)
				{
					console.error("Unable to find both finalist sockets");
					return;
				}

				socket1.leave(game.roomId);
				socket2.leave(game.roomId);

				const finalGame =
					await this.gameManager.createTournamentMatch(
						socket1,
						socket2,
						tournamentResult.nextRoomId,
						game.tournamentId!,
					);

				socket1.join(finalGame.roomId);
				socket2.join(finalGame.roomId);

				const payload = {
					roomId: finalGame.roomId,
					tournamentId: finalGame.tournamentId,

					player1: {
						id: socket1.id,
						username: socket1.data.username,
					},

					player2: {
						id: socket2.id,
						username: socket2.data.username,
					},

					isFinal: true,
				};

				socket1.emit("tournament_bracket", bracket);
				socket2.emit("tournament_bracket", bracket);

				socket1.emit("match_found", payload);
				socket2.emit("match_found", payload);

				this.emitGameOver(loserSocket, {
					winner:
						winnerSocket === game.player1
							? 1
							: 2,
				}, game);

				this.gameManager.removeGame(game.roomId);
				return;
			}

			this.emitGameOver(loserSocket, {
				winner:
					winnerSocket === game.player1
						? 1
						: 2,
			}, game);

			winnerSocket.emit("tournament_waiting_final");

			this.gameManager.removeGame(game.roomId);
			return;
		}

		this.emitGameOver(winnerSocket, {
			winner:
				winnerSocket === game.player1
					? 1
					: 2,
		}, game);

		this.emitGameOver(loserSocket, {
			winner:
				winnerSocket === game.player1
					? 1
					: 2,
		}, game);

		this.gameManager.removeGame(game.roomId);
	}

	handleConnection(client: Socket)
	{
		const cookies = parse(client.handshake.headers.cookie ?? "");

		try
		{
			const payload = this.jwtService.verify<{
					sub: string;
					username: string;
					tfa: string;
				}>(cookies.access_token);
				
			client.data.userId = payload.sub;
			this.gameManager.registerPlayer(
				client.data.userId,
				client,
			);
			client.data.username = payload.username;
		}
		catch
		{
			console.log("Invalid JWT");
			client.disconnect();
		}
	}

	async handleDisconnect(client: Socket)
	{
		console.log(`${client.id} disconnected.`);

		if (client.data.userId)
		{
			this.gameManager.unregisterPlayer(client.data.userId);
		}
		this.gameManager.removeWaitingPlayer(client);
		await this.handlePlayerForfeit(client);
	}

	private async handlePlayerForfeit(client: Socket)
	{
		const game = this.gameManager.findGameByPlayer(client);
	
		if (!game)
		{
			if (client.data.userId)
			{
				const result = await this.tournamentService.leaveTournament(
					client.data.userId,
				);

				// Le joueur qui part était déjà qualifié pour la finale
				// (aucune GameSession active pour lui) : on retient le
				// forfait pour que l'autre finaliste soit déclaré champion
				// dès qu'il est connu, au lieu d'attendre indéfiniment.
				if (result?.round === "FINAL" && result.tournamentId)
				{
					this.tournamentState.markFinalForfeit(
						result.tournamentId,
						client.data.userId,
					);
				}
			}
			return;
		}

		const p1won = game.player2.id === client.id;

		if (game.tournamentId)
		{
			const winnerSocket =
				game.player1.id === client.id
					? game.player2
					: game.player1;

			const loserSocket =
				game.player1.id === client.id
					? game.player1
					: game.player2;

			await this.finishTournamentMatch(
				game,
				winnerSocket,
				loserSocket,
			);

			return;
		}

		this.server.to(game.roomId).emit("game_over", {
			winner: p1won ? 1 : 2,
			player1Score: game.player1Score,
			player2Score: game.player2Score,
			player1Time: game.player1Time,
			player2Time: game.player2Time,
			reason: "disconnect",
		});

		this.gameManager.removeGame(game.roomId);
	}

	@SubscribeMessage("leave_game")
	async handleLeaveGame(
		@ConnectedSocket() client: Socket,
	)
 	{
		// handlePlayerForfeit gère à la fois le cas "partie en cours" et le
		// cas "en attente de la finale" (et marque le forfait le cas
		// échéant) — pas besoin de dupliquer sa logique ici.
		await this.handlePlayerForfeit(client);
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
		console.log("MESSAGE: PLAYER READY");
		const ready = this.gameManager.markPlayerReady(
			data.roomId,
			client,
		);
		
		if (!ready)
			return;
		
		const game = this.gameManager.getGame(data.roomId);

		if (!game)
			return;

		console.log("EMIT : P1 GAME STARTED");
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

		console.log("EMIT : P2 GAME STARTED");
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
		const game = this.gameManager.getGame(data.roomId);

		if (game?.ai)
			this.startAITurn(data.roomId);
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

		console.log("EMIT : MATCH FOUND");
		this.server.to(game.roomId).emit("match_found", {
			roomId: game.roomId,
			tournamentId: game.tournamentId,
			player1: {
					id: game.player1.id,
					username: game.player1.data.username,
			},

			player2: {
					id: game.player2.id,
					username: game.player2.data.username,
			},
		});
	}	

	@SubscribeMessage("join_ai")
	async handleJoinAI(
		@ConnectedSocket() client: Socket,
	)
	{
		const game = await this.gameManager.createAIMatch(client);
console.log("[AI] handleJoinAI", client.id);
console.trace();
		client.join(game.roomId);

		console.log("[AI] Emitting match_found");
		client.emit("match_found", {
			roomId: game.roomId,

			player1: {
				id: client.id,
				username: client.data.username,
			},

			player2: {
				id: "AI",
				username: "TriviaBot",
			},

			ai: true,
		});
	}
}
