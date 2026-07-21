import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { GameSession } from "./game.session";
import { TriviaService } from "../trivia/trivia.service";

@Injectable()
export class GameManager
{
	constructor(private readonly triviaService: TriviaService) {}
    private waitingPlayer: Socket | null = null;

    private games = new Map<string, GameSession>();
	private connectedPlayers = new Map<string, Socket>();

// -----------------------------------------------------------------------------
// Matchmaking
// -----------------------------------------------------------------------------

    async createMatch(player: Socket): Promise<GameSession | null>
    {
		 if (this.waitingPlayer?.id === player.id)
        {
            console.log(`${player.id} is already waiting.`);
            return null;
        }

        if (this.waitingPlayer === null)
        {
            this.waitingPlayer = player;
            return null;
        }

        const roomId = `room-${Date.now()}`;

        const game = new GameSession(
            roomId,
            this.waitingPlayer,
            player,
        );
//		game.questions = await this.triviaService.getTestQuestions();
		game.questions = await this.triviaService.getQuestions();

        this.games.set(roomId, game);

		console.log("Game created:", roomId);

        this.waitingPlayer = null;

        return game;
    }

	async createTournamentMatch(
		player1: Socket,
		player2: Socket,
		roomId: string,
	): Promise<GameSession>
	{
		const game = new GameSession(
			roomId,
			player1,
			player2,
		);

		game.questions = await this.triviaService.getQuestions();

		this.games.set(roomId, game);

		console.log("Tournament game created:", roomId);

		return game;
	}

// -----------------------------------------------------------------------------
// Gameplay
// -----------------------------------------------------------------------------

	submitAnswer(
		roomId: string,
		player: Socket,
		answer: string | null,
		timeLeft: number,
	)

	 {
        const game = this.games.get(roomId);
		const usedTime = 20 - timeLeft;

        if (!game)
        {
            console.log("Game not found");
            return;
        }

		const question = game.questions[game.currentQuestion];

		if (!question)
		{
			console.warn(
				`Answer reçu après la fin de la partie (${roomId})`
			);
			return;
		}

        const isCorrect = answer === question.correct;

		if (!game.questionHistory[game.currentQuestion])
		{
			game.questionHistory[game.currentQuestion] = {
				question: question.question,
				category: game.questions[game.currentQuestion].category,
				correctAnswer: question.correct,

				player1Answer: null,
				player2Answer: null,

				player1Correct: false,
				player2Correct: false,
			};
		}

		if (player.id === game.player1.id)
		{
			game.player1Time += usedTime;
			game.questionHistory[game.currentQuestion].player1Answer = answer;
			game.questionHistory[game.currentQuestion].player1Correct = isCorrect;
		}
		else
		{
			game.player2Time += usedTime;
			game.questionHistory[game.currentQuestion].player2Answer = answer;
			game.questionHistory[game.currentQuestion].player2Correct = isCorrect;
		}


		const hadThreeChoice =
			player.id === game.player1.id
				? game.player1ThreeChoice
				: game.player2ThreeChoice;

		const hadHideAnswer =
			player.id === game.player1.id
				? game.player1HideAnswer
				: game.player2HideAnswer;

		// Bonuses are consumed as soon as the player answers.

		if (game.player1ThreeChoice)
			game.player1ThreeChoice = false;

		if (game.player2ThreeChoice)
			game.player2ThreeChoice = false;

		if (game.player1HideAnswer)
			game.player1HideAnswer = false;

		if (game.player2HideAnswer)
			game.player2HideAnswer = false;

		if (player.id === game.player1.id)
		{
			game.player1Streak = this.updateCorrectStreak(
				game.player1Streak,
				isCorrect,
			);
		}
		else
		{
			game.player2Streak = this.updateCorrectStreak(
				game.player2Streak,
				isCorrect,
			);
		}

		//Update score for each player

		if (isCorrect)
		{
			if (player.id === game.player1.id)
			{
				if (game.player1DoublePoint)
				{
					game.player1Score += 2;
					game.player1DoublePoint = false;
				}
				else
					game.player1Score++;
			}
			else
			{
				if (game.player2DoublePoint)
				{
					game.player2Score += 2;
					game.player2DoublePoint = false;
				}
				else
					game.player2Score++;
			}
		}
		
		if (player.id === game.player1.id)
			game.player1Answered = true;
		else
			game.player2Answered = true;

		if (game.player1Answered && game.player2Answered)
		{
			game.currentQuestion++;

			game.player1Answered = false;
			game.player2Answered = false;
			this.activateBonuses(game);

			if (game.currentQuestion >= game.questions.length)
			{
				// Decide the winner.
				// Highest score wins.
				// In case of a tie, the fastest player wins.

				let winner: 0 | 1 | 2;

				if (game.player1Score > game.player2Score)
					winner = 1;
				else if (game.player2Score > game.player1Score)
					winner = 2;
				else
				{
					// Draw score = 0
					if (game.player1Time < game.player2Time)
						winner = 1;
					else if (game.player2Time < game.player1Time)
						winner = 2;
					else
						winner = 0;
				}

				const matchStats = {
					winner,

					player1Score: game.player1Score,
					player2Score: game.player2Score,

					questions: game.questionHistory,
				};
				return {
					nextQuestion: false,
					gameOver: true,
					correct: isCorrect,
					winner,
					stats: matchStats,
				};
			}
			if (player.id === game.player1.id)
			{
				if (hadThreeChoice)
					game.player1ThreeChoice = false;

				if (hadHideAnswer)
					game.player1HideAnswer = false;
			}
			else
			{
				if (hadThreeChoice)
					game.player2ThreeChoice = false;

				if (hadHideAnswer)
					game.player2HideAnswer = false;
			}

			console.log(game.questionHistory);
			return {
				nextQuestion: true,
				gameOver: false,
				questionIndex: game.currentQuestion,
				question: game.questions[game.currentQuestion],
				correct: isCorrect,
				player1Score: game.player1Score,
				player2Score: game.player2Score,
				player1Streak: game.player1Streak,
				player2Streak: game.player2Streak,
				player1ThreeChoice: game.player1ThreeChoice,
				player2ThreeChoice: game.player2ThreeChoice,
				player1HideAnswer: game.player1HideAnswer,
				player2HideAnswer: game.player2HideAnswer,
				player1DoublePoint: game.player1DoublePoint,
				player2DoublePoint: game.player2DoublePoint,
			};
		}

		if (player.id === game.player1.id)
		{
			if (hadThreeChoice)
				game.player1ThreeChoice = false;

		}
		else
		{
			if (hadThreeChoice)
				game.player2ThreeChoice = false;

		}
		console.log(game.questionHistory[0]);
		return {
			nextQuestion: false,
			gameOver: false,
			correct: isCorrect,
			player1Score: game.player1Score,
			player2Score: game.player2Score,
			player1Streak: game.player1Streak,
			player2Streak: game.player2Streak,
			player1ThreeChoice: game.player1ThreeChoice,
			player2ThreeChoice: game.player2ThreeChoice,
			player1HideAnswer: game.player1HideAnswer,
			player2HideAnswer: game.player2HideAnswer,
			player1DoublePoint: game.player1DoublePoint,
			player2DoublePoint: game.player2DoublePoint,
		};
	}

	// Build the answers sent to a specific player.
	// This is where gameplay bonuses modify the displayed answers.

	public buildDisplayedAnswers(
		question: {
			question: string;
			correct: string;
			answers: string[];
		},
		threeChoice: boolean,
		hideAnswer: boolean,
	): {
		label: string;
		value: string;
	}[]
	{
		let displayedAnswers = question.answers.map(answer => ({
			label: answer,
			value: answer,
		}));

		// ThreeChoice
		if (threeChoice)
		{
			const wrongAnswers = displayedAnswers.filter(
				answer => answer.value !== question.correct,
			);

			displayedAnswers = [
				wrongAnswers[0],
				wrongAnswers[1],
				displayedAnswers.find(
					answer => answer.value === question.correct,
				)!,
			];
		}

		// HideAnswer
		if (hideAnswer)
		{
			const hiddenIndex = Math.floor(
				Math.random() * displayedAnswers.length,
			);

			displayedAnswers[hiddenIndex].label =
				"Hidden answer";
		}

		return displayedAnswers;
	}

	// Build the answers sent to a specific player.
	// This is where gameplay bonuses modify the displayed answers.

	private updateCorrectStreak(
		streak: number,
		correct: boolean,
	): number
	{
		if (correct)
		{
			if (streak >= 0)
				return streak + 1;

			return 1;
		}

		if (streak <= 0)
			return streak - 1;

		return -1;
	}

	private activateBonuses(game: GameSession)
	{
		if (game.player1Streak === 3)
			game.player1ThreeChoice = true;

		if (game.player1Streak === 5)
			game.player1HideAnswer = true;

		if (game.player1Streak <= -5)
			game.player1DoublePoint = true;

		if (game.player2Streak === 3)
			game.player2ThreeChoice = true;

		if (game.player2Streak === 5)
			game.player2HideAnswer = true;

		if (game.player2Streak <= -5)
			game.player2DoublePoint = true;
	}

	markPlayerReady(
		roomId: string,
		player: Socket,
	): boolean
	{
		const game = this.games.get(roomId);

		if (!game)
			return false;

		if (player.id === game.player1.id)
			game.player1Ready = true;
		else
			game.player2Ready = true;

		return game.player1Ready && game.player2Ready;
	}

	markQuestionsLoaded(
		roomId: string,
		player: Socket,
	): boolean
	{
		const game = this.games.get(roomId);

		if (!game)
			return false;

		if (player.id === game.player1.id)
			game.player1QuestionsLoaded = true;
		else
			game.player2QuestionsLoaded = true;

		return (
			game.player1QuestionsLoaded &&
			game.player2QuestionsLoaded
		);
	}

// !!!!!!!!!!!!!!!!!!!!
// !!!!! Getters !!!!!!
// !!!!!!!!!!!!!!!!!!!!

    getGame(roomId: string)
    {
        return this.games.get(roomId);
    }

	findGameByPlayer(player: Socket): GameSession | null
	{
		for (const game of this.games.values())
		{
			if (
				game.player1.id === player.id ||
				game.player2.id === player.id
			)
			{
				return game;
			}
		}
		return null;
	}

	removeGame(roomId: string): void
	{
		this.games.delete(roomId);
	}

	removeWaitingPlayer(player: Socket): void
	{
		if (this.waitingPlayer?.id === player.id)
		{
			this.waitingPlayer = null;
		}
	}

	registerPlayer(userId: string, socket: Socket): void
	{
		this.connectedPlayers.set(userId, socket);
	}

	unregisterPlayer(userId: string): void
	{
		this.connectedPlayers.delete(userId);
	}

	getPlayerSocket(userId: string): Socket | undefined
	{
		return this.connectedPlayers.get(userId);
	}
}
