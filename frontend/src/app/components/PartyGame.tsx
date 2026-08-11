import { socket } from "../../socket/socket";

import { useState, useEffect } from "react";
import { useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";

import GamePage from "./GamePage";
import MatchmakingScreen from "./MatchmakingScreen";
import ResultsScreen from "./ResultScreen";
import TournamentBracket from "./TournamentBracket";

import type { PlayerState } from "../types/PlayerState";
import type { GameState } from "../types/GameState";
import type { Question } from "../types/question";
import TournamentWaitingFinal from "../pages/TournamentWaitingFinal";

export default function QuizPage()
{
	const { mode } = useParams<{ mode: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const { setIsInGame } = useGame();
	const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
	const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

	const [questions, setQuestions] = useState<Question[]>([]);
	const [gameStarted, setGameStarted] = useState(false);
	const [waitingForFinal, setWaitingForFinal] = useState(false);
	const [tournamentBracket, setTournamentBracket] = useState<any>(null);
	const [opponentReady, setOpponentReady] = useState(false);
	const player: PlayerState = {
			score: 0,
			answered: false,
			totalTimeUsed: 0,
			streak: 0,
			hideAnswer: false,
			threeChoice: false,
			doublePoint: false,
		};
	const [game, setGame] = useState<GameState>(
		{
			currentQuestion: questions[0],
			questionIndex: 0,
			time_left: 20,
			localPlayer: { ...player},
			enemyPlayer: { ...player},
			gameOver: false,
			isPlayer1: false,
			mode: "party",
			answeredQuestions: [],
		});
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [revealed, setRevealed] = useState(false);
	const joinSentRef = useRef(false);
	const roomIdRef = useRef("");
	const isPlayer1Ref = useRef(false);
	const bracketTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() =>
	{
		if (mode === "tournament" && !location.state)
		{
			navigate("/", { replace: true });
		}
	}, [mode, location.state, navigate]);

	useEffect(() =>
	{
		if (mode === "tournament" && location.state)
		{
			initializeMatch(location.state);
		}
	}, []);

	useEffect(() =>
	{
		setIsInGame(true);

		return () =>
		{
			setIsInGame(false);
		};
	}, []);

	useEffect(() =>
	{
		if (game.gameOver)
			setIsInGame(false);
	}, [game.gameOver]);

	function initializeMatch(data: any)
	{
		setWaitingForFinal(false);
		const isPlayer1 = socket.id === data.player1.id;

		isPlayer1Ref.current = isPlayer1;

		setGame(previousGame => ({
			...previousGame,
			roomId: data.roomId,
			isPlayer1,
			time_left: 20,
			questionIndex: 0,
  			score: 0,
    		gameOver: false,
   			question: undefined,
			localPlayer: {
				...previousGame.localPlayer,
				username: isPlayer1
					? data.player1.username
					: data.player2.username,
				answered: false,
			},
			enemyPlayer: {
				...previousGame.enemyPlayer,
				username: isPlayer1
					? data.player2.username
					: data.player1.username,
				answered: false,
			},
		}));

		roomIdRef.current = data.roomId;
	}
	function handle_answer(answer: string)
{
	if (game.gameOver || game.localPlayer.answered)
		return;

	setSelectedAnswer(answer);
	setRevealed(true);

	setGame(previousGame =>
	{
		return {
			...previousGame,
			answeredQuestions: [
				...previousGame.answeredQuestions,
				{
					question: previousGame.currentQuestion,
					playerAnswer: answer,
					correct: false,
				},
			],
		};
	});

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
		socket.on("connect", () => {});

		socket.connect();

		const joinGame = () =>
		{
			switch (mode)
			{
				case "party":
					socket.emit("join_queue");
					break;

				case "tournament":
					break;

				case "ai":
					if (joinSentRef.current)
						return;

					joinSentRef.current = true;
					socket.emit("join_ai");
					break;

				default:
					console.error("Unknown game mode:", mode);
					break;
			}
		};

		if (!socket.connected)
		{
			socket.once("connect", joinGame);
		}
		else
		{
			joinGame();
		}

		socket.on("connect_error", (error) => {});

		socket.on("match_found", (data) => {
			if (data.isFinal)
			{
				setOpponentReady(true);

				// On initialise le match tout de suite (roomId, isPlayer1...)
				// même si l'écran de bracket reste affiché 5s de plus : sinon,
				// en cas de forfait pendant ce délai, isPlayer1 resterait sur
				// la valeur de la demi-finale et le calcul victoire/défaite
				// serait faux.
				initializeMatch(data);

				bracketTimeoutRef.current = setTimeout(() =>
				{
					bracketTimeoutRef.current = null;
					setWaitingForFinal(false);
					setOpponentReady(false);
					setTournamentBracket(null);
				}, 5000);
			}
			else
				initializeMatch(data);
		});

		socket.on("game_started", (data) =>
		{
			setQuestions(data.questions);
			setGame(previousGame => ({
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
			setGame(previousGame => ({
				...previousGame,
				currentQuestion: data.question,
				questionIndex: previousGame.questionIndex + 1,
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
			setGame(previousGame =>
			{
				const answeredQuestions = [...previousGame.answeredQuestions];

				if (data.playerId === socket.id && answeredQuestions.length > 0)
				{
					answeredQuestions[answeredQuestions.length - 1] = {
						...answeredQuestions[answeredQuestions.length - 1],
						correct: data.correct,
					};
				}

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
						answeredQuestions,

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
					answeredQuestions,
					time_left: Math.min(previousGame.time_left, 5),

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

		socket.on("tournament_bracket", (bracket) => {
			setTournamentBracket(bracket);
		});
		socket.on("tournament_waiting_final", () =>
		{
			setGameStarted(false);
			setWaitingForFinal(true);
			setOpponentReady(false);

			setGame(previousGame => ({
				...previousGame,

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

		socket.on("tournament_champion", () =>
		{
			if (bracketTimeoutRef.current)
			{
				clearTimeout(bracketTimeoutRef.current);
				bracketTimeoutRef.current = null;
			}

			setTournamentBracket(null);
			setGameStarted(false);
			setWaitingForFinal(false);
			setOpponentReady(false);

			setGame(previousGame => ({
				...previousGame,
				gameOver: true,
				winner: previousGame.isPlayer1 ? 1 : 2,
			}));
		});

		socket.on("game_over", (data) =>
		{
			// Annule le timer d'affichage du bracket : sinon, s'il se
			// déclenche après coup, il ré-initialise un match déjà terminé
			// et bloque le joueur restant sur un écran d'attente sans fin.
			if (bracketTimeoutRef.current)
			{
				clearTimeout(bracketTimeoutRef.current);
				bracketTimeoutRef.current = null;
			}

			setTournamentBracket(null);
			setGameStarted(false);

			const playerScore = isPlayer1Ref.current
				? data.player1Score
				: data.player2Score;

			const enemyScore = isPlayer1Ref.current
				? data.player2Score
				: data.player1Score;

			setGame(previousGame =>
			{
				return {
					...previousGame,
					gameOver: true,
					winner: data.winner,

					localPlayer: {
						...previousGame.localPlayer,
						score: playerScore,
					},

					enemyPlayer: {
						...previousGame.enemyPlayer,
						score: enemyScore,
					},
				};
			});
		});

		return () =>
		{
			if (bracketTimeoutRef.current)
			{
				clearTimeout(bracketTimeoutRef.current);
				bracketTimeoutRef.current = null;
			}

			socket.off("connect");
			socket.off("connect_error");
			socket.off("match_found");
			socket.off("game_started");
			socket.off("start_game");
			socket.off("next_question");
			socket.off("player_answered");
			socket.off("tournament_waiting_final");
			socket.off("tournament_champion");
			socket.off("game_over");
			socket.off("connect", joinGame);
			socket.off("tournament_bracket");
			joinSentRef.current = false;
		//	socket.disconnect();
		};
	}, [mode]);

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
			if (!gameStarted || game.gameOver)
   				return;
			const timer = setInterval(() => 
					{
						setGame((previousGame) => (
							{
								...previousGame,
								time_left: Math.max(0, previousGame.time_left - 1)
							}));
					}, 1000);

				return () => clearInterval(timer);
		}, [game.questionIndex, gameStarted]);

	// Automatically submit an empty answer when the timer expires.

	useEffect(() =>
{
	if (game.time_left <= 0 && !game.localPlayer.answered)
	{
		setGame(previousGame => ({
			...previousGame,
			answeredQuestions: [
				...previousGame.answeredQuestions,
				{
					question: previousGame.currentQuestion,
					playerAnswer: null,
					correct: false,
				},
			],
		}));

		socket.emit("answer", {
			roomId: game.roomId,
			answer: null,
			timeLeft: 0,
		});
	}
}, [game.time_left]);

	if (tournamentBracket)
	{
		return (
			<TournamentBracket
				bracket={tournamentBracket}
			/>
		);
	}

	if (game.gameOver)
	{
		return (
			<ResultsScreen
				game={game}
				onBack={() => {
					socket.emit("leave_queue");
					navigate("/");
				}}
			/>
		);
	}
	
	if (waitingForFinal)
	{
		return (
			<TournamentWaitingFinal opponentReady={opponentReady} />
		);
	}

	if (!gameStarted)
	{
		return (
			<MatchmakingScreen
				onCancel={() => {
					socket.emit("leave_queue");
					navigate("/");
				}}
			/>
		);
	}

		return (
				<GamePage
					game={game}
					selectedAnswer={selectedAnswer}
					revealed={revealed}
					waitingForOpponent={game.localPlayer.answered}
					onAnswer={handle_answer}
					onBack={() => {
						socket.disconnect();
						navigate("/");
					}}
				/>
		);
}
