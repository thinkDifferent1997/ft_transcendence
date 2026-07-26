import type { PlayerState } from "./PlayerState";
import type { Question } from "./question";

export interface answeredQuestions: {
		question: Question;
		playerAnswer: string | null;
	}[];

export interface GameState
{
	roomId: string;
	currentQuestion: Question;
	questionIndex: number;
	time_left: number;

	localPlayer: PlayerState;
	isPlayer1: boolean;
	enemyPlayer: PlayerState;
	answeredQuestions: {
		question: Question;
		playerAnswer: string | null;
		correct?: boolean,
		timeLeft: number,
	}[];
	gameOver: boolean;
	mode: string;
	winner: 0 | 1 | 2;
	endedbyDisconnect: boolean;
}

