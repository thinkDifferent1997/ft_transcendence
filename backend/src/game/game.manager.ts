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

	// !!!!!!!!!!!!!!!!!!!!
	// !!! MATCHMAKING !!!!
	// !!!!!!!!!!!!!!!!!!!!

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
		game.questions = await this.triviaService.getTestQuestions();

        this.games.set(roomId, game);

		console.log("Game created:", roomId);

        this.waitingPlayer = null;

        return game;
    }
	
	// !!!!!!!!!!!!!!!!!!!!
	// !!!!! GAMEPLAY !!!!!
	// !!!!!!!!!!!!!!!!!!!!

	submitAnswer(
		roomId: string,
		player: Socket,
		answer: string,
	)

	 {
        const game = this.games.get(roomId);

        if (!game)
        {
            console.log("Game not found");
            return;
        }

        const question = game.questions[game.currentQuestion];

        const isCorrect = answer === question.correct;

		const hadThreeChoice =
			player.id === game.player1.id
				? game.player1ThreeChoice
				: game.player2ThreeChoice;

		const hadHideAnswer =
			player.id === game.player1.id
				? game.player1HideAnswer
				: game.player2HideAnswer;

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
				return {
					nextQuestion: false,
					gameOver: true,
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

// !!!!!!!!!!!!!!!!!!!!
// !!!!! Getters !!!!!!
// !!!!!!!!!!!!!!!!!!!!

    getGame(roomId: string)
    {
        return this.games.get(roomId);
    }
}
