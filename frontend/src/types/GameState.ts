import type { PlayerState } from "./PlayerState";
import type { Question } from "./question";

export interface GameState
{
	roomId: string;
	currentQuestion: Question;
	questionIndex: number;
	time_left: number;

	localPlayer: PlayerState;
	isPlayer1: boolean;
	enemyPlayer: PlayerState;

	gameOver: boolean;
}
