import { socket } from "../socket/socket";
import { useState, useEffect } from "react";
import ScoreBoard from "../components/ScoreBoard";
import QuestionCard from "../components/QuestionCard";
import WaitingScreen from "../components/WaitingScreen";
import GameOverScreen from "../components/GameOverScreen";
import PlayerBonusPanel from "../components/PlayerBonus";

import type { PlayerState } from "../types/PlayerState";
import type { GameState } from "../types/GameState";
import type { Question } from "../types/question";

//import { getDisplayedAnswers } from "../game/display";

export default function QuizPage()
{
	const player: PlayerState = {
			score: 0,
			answered: false,
			totalTimeUsed: 0,
			streak: 0,
			hideAnswer: false,
			//hiddenAnswerIndex: -1,
			threeChoice: false,
			doublePoint: false,
		};

	const [questions, setQuestions] = useState<Question[]>([]);

	const [game, setGame] = useState<GameState>(
		{
			currentQuestion: questions[0],
			questionIndex: 0,
			time_left: 20,
			localPlayer: { ...player},
			enemyPlayer: { ...player},
			gameOver: false,
			isPlayer1: false,
		});

	function	handle_answer(answer: string)
	{
		socket.emit("answer", {
			roomId: game.roomId,
			answer,
		});
		console.log(game.roomId);
	}

	useEffect(() =>
	{
		socket.on("connect", () =>
		{
			console.log("Connected :", socket.id);
		});

		socket.connect();

		if (!socket.connected)
		{
			socket.once("connect", () =>
			{
				socket.emit("join_queue");
			});
		}
		else
		{
			socket.emit("join_queue");
		}

		socket.on("connect_error", (error) =>
		{
			console.log("Error :", error);
		});

		
		socket.on("match_found", (data) =>
		{
			console.log("Match found !");
			setGame(previousGame => ({
				...previousGame,
				roomId: data.roomId,
				isPlayer1: socket.id === data.player1Id,
			}));
			console.log(
				"socket.id =", socket.id,
				"player1Id =", data.player1Id,
				"isPlayer1 =", socket.id === data.player1Id,
			);
		});

		socket.on("game_started", (data) =>
		{
			console.log("Questions :", data.questions);

			setQuestions(data.questions);
			setGame((previousGame) => ({
            ...previousGame,
            currentQuestion: data.questions[0],
        }));
    });
	socket.on("next_question", (data) =>
	{
		console.log("Next question received");

		setGame((previousGame) => ({
			...previousGame,
			currentQuestion: data.question,
			time_left: 20,

			localPlayer: {
				...previousGame.localPlayer,
				answered: false,
			},

			enemyPlayer: {
				...previousGame.enemyPlayer,
				answered: false,
			},
		}));
	});

	socket.on("player_answered", (data) =>
	{
		console.log("PLAYER ANSWERED");
		
		setGame(previousGame =>
		{
			const localScore = previousGame.isPlayer1
				? data.player1Score
				: data.player2Score;

			const enemyScore = previousGame.isPlayer1
				? data.player2Score
				: data.player1Score;

			const localStreak = previousGame.isPlayer1
				? data.player1Streak
				: data.player2Streak;

			const enemyStreak = previousGame.isPlayer1
				? data.player2Streak
				: data.player1Streak;

			const localThreeChoice = previousGame.isPlayer1
					? data.player1ThreeChoice
					: data.player2ThreeChoice;

			const localHideAnswer = previousGame.isPlayer1
					? data.player1HideAnswer
					: data.player2HideAnswer;

		/*	const localHiddenAnswer =
				previousGame.isPlayer1
					? data.player1HiddenAnswer
					: data.player2HiddenAnswer;*/

			const localDoublePoint = previousGame.isPlayer1
					? data.player1DoublePoint
					: data.player2DoublePoint;


					console.log({
    localHide: localHideAnswer,
    localStreak: localStreak,
});

			if (data.playerId === socket.id)
			{
				return {
					...previousGame,

					localPlayer: {
						...previousGame.localPlayer,
						answered: true,
						score: localScore,
						streak: localStreak,
						threeChoice: localThreeChoice,
						hideAnswer: localHideAnswer,
						//hiddenAnswerIndex: localHiddenAnswer,
						doublePoint: localDoublePoint,
					},

					enemyPlayer: {
						...previousGame.enemyPlayer,
						score: enemyScore,
						streak: enemyStreak,
					},
				};
			}

			return {
				...previousGame,
				time_left: Math.min(previousGame.time_left, 3),

				localPlayer: {
					...previousGame.localPlayer,
					score: localScore,
					streak: localStreak,
					threeChoice: localThreeChoice,
					hideAnswer: localHideAnswer,
					//hiddenAnswerIndex: localHiddenAnswer,
					doublePoint: localDoublePoint,
				},

				enemyPlayer: {
					...previousGame.enemyPlayer,
					answered: true,
					score: enemyScore,
					streak: enemyStreak,
				},
			};
		});
	});

		socket.connect();

		return () =>
		{
			socket.off("connect");
			socket.off("connect_error");
			socket.off("match_found");
			socket.off("game_started");
			socket.off("next_question");
			socket.off("player_answered");
			socket.disconnect();
		};
	}, []);

	useEffect(() =>
		{
			//set Interval will restart the timer each time the question changes
			//set time left every 1000ms, means each sec
			const timer = setInterval(() => 
					{
						setGame((previousGame) => (
							{
								...previousGame,
								time_left: previousGame.time_left - 1,
							}));
					}, 1000);

				return () => clearInterval(timer);
		}, [game.questionIndex]);

	useEffect(() =>
			{
				if (game.time_left < 0)
				{
					socket.emit("answer", {
						roomId: game.roomId,
						answer: null,
					});
				}
			}, [game.time_left]);

	if (questions.length === 0)
	{
    	return <h1>Loading ...</h1>;
	}

	if (game.gameOver)
		{
			//return GameOver component
			return (
				<GameOverScreen
					didWin = {game.localPlayer.score >= questions.length / 2}
					score = {game.localPlayer.score}
				maxScore = {questions.length}
			/>
		);
	}
	
	if (game.localPlayer.answered)
	{
		return (
			<div>
					<WaitingScreen
						score = {game.localPlayer.score}
						enemyScore = {game.enemyPlayer.score}
						time_left = {game.time_left}
					/>
					<PlayerBonusPanel
						streak={game.localPlayer.streak}
						threeChoice={game.localPlayer.threeChoice}
						hideAnswer={game.localPlayer.hideAnswer}
						doublePoint={game.localPlayer.doublePoint}
					/>
				</div>
			);
		}

/*		const displayedAnswers = getDisplayedAnswers(game.currentQuestion.answers,
			game.currentQuestion.correct, game.localPlayer.threeChoice,
			game.localPlayer.hideAnswer, game.localPlayer.hiddenAnswerIndex);*/

		return (
			<div>
				<ScoreBoard
					score = {game.localPlayer.score}
					enemyScore = {game.enemyPlayer.score}
					time_left = {game.time_left}
				/>
				<PlayerBonusPanel
          			streak={game.localPlayer.streak}
					threeChoice={game.localPlayer.threeChoice}
					hideAnswer={game.localPlayer.hideAnswer}
					doublePoint={game.localPlayer.doublePoint}
				/>
				<QuestionCard
					question={game.currentQuestion}
					answers={game.currentQuestion.answers}
					//answers={displayedAnswers}
					onAnswer={handle_answer}
				/>
				<p>
					Adversaire :
					{" "}
					{game.enemyPlayer.answered
							? "Answered."
							: "Still thinking..."}
				</p>
			</div>
		);
}
