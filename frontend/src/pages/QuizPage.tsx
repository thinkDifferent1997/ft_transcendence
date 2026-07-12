import { socket } from "../socket/socket";
import GameOver from "./GameOver";
//import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRef } from "react";

import ScoreBoard from "../app/components/quiz/ScoreBoard";
import QuestionCard from "../app/components/quiz/QuestionCard";
import WaitingScreen from "../app/components/quiz/WaitingScreen";
import PlayerBonusPanel from "../app/components/quiz/PlayerBonus";

import type { PlayerState } from "../types/PlayerState";
import type { GameState } from "../types/GameState";
import type { Question } from "../types/question";

export default function QuizPage({ onBack }: { onBack?: () => void })
{
	const player: PlayerState = {
			score: 0,
			answered: false,
			totalTimeUsed: 0,
			streak: 0,
			hideAnswer: false,
			threeChoice: false,
			doublePoint: false,
		};

	//const navigate = useNavigate();

	const [questions, setQuestions] = useState<Question[]>([]);
	const [gameStarted, setGameStarted] = useState(false);
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

	const [gameOverData, setGameOverData] = useState<{
		playerScore: number;
		enemyScore: number;
		victory: boolean;
		draw: boolean;
	} | null>(null);

	

	// Keep stable values inside Socket.IO callbacks with useRef.

	const roomIdRef = useRef("");
	const isPlayer1Ref = useRef(false);

	function	handle_answer(answer: string)
	{
		socket.emit("answer", {
			roomId: game.roomId,
			answer,
			timeLeft: game.time_left,
		});
	}

	// Socket events
	// Register every Socket.IO listener once when the component mounts.

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
			isPlayer1Ref.current = socket.id === data.player1Id;
			setGame(previousGame => ({
				...previousGame,
				roomId: data.roomId,
				isPlayer1: socket.id === data.player1Id,
			}));
			roomIdRef.current = data.roomId;
		});

		socket.on("game_started", (data) =>
		{
			setQuestions(data.questions);
			setGame((previousGame) => ({
            ...previousGame,
            currentQuestion: data.questions[0],
        }));

		socket.emit("questions_loaded",
		{
			roomId: roomIdRef.current,
		});
    });

	socket.on("start_game", () =>
	{
		setGameStarted(true);
	});

	socket.on("next_question", (data) =>
	{

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

	// Update scores, streaks and bonuses after every answer.

	socket.on("player_answered", (data) =>
	{
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

			const localDoublePoint = previousGame.isPlayer1
					? data.player1DoublePoint
					: data.player2DoublePoint;

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

	socket.on("game_over", (data) =>
	{
		const playerScore = isPlayer1Ref.current
			? data.player1Score
			: data.player2Score;

		const enemyScore = isPlayer1Ref.current
			? data.player2Score
			: data.player1Score;

		const victory =
			(isPlayer1Ref.current && data.winner === 1) ||
			(!isPlayer1Ref.current && data.winner === 2);

		const draw = data.winner === 0;

		setGameOverData({
			playerScore,
			enemyScore,
			victory,
			draw,
		});	
	});

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

	// Notify the backend that this client is ready.

	useEffect(() =>
	{
		if (!game.roomId)
			return;

		socket.emit("player_ready", {
			roomId: game.roomId,
		});

	}, [game.roomId]);

	// Restart the timer whenever a new question starts.

	useEffect(() =>
		{
			if (!gameStarted)
   				return;
			const timer = setInterval(() => 
					{
						setGame((previousGame) => (
							{
								...previousGame,
								time_left: previousGame.time_left - 1,
							}));
					}, 1000);

				return () => clearInterval(timer);
		}, [game.questionIndex, gameStarted]);

	// Automatically submit an empty answer when the timer expires.

	useEffect(() =>
			{
				if (game.time_left < 0)
				{
					socket.emit("answer", {
						roomId: game.roomId,
						answer: null,
					    timeLeft: 0,
					});
				}
			}, [game.time_left]);

	if (questions.length === 0)
	{
    	return <h1>Loading questions...</h1>;
	}

	if (gameOverData) {
		return <GameOver data={gameOverData} onBack={onBack} />;
	}

	if (!gameStarted)
	{
		return (
			<div>
				<h1>Waiting for the other player...</h1>
			</div>
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
