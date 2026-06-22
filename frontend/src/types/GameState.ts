import type { PlayerState } from "./PlayerState";
import type { Question } from "./question";

export interface GameState
{
	currentQuestion: Question;
	questionIndex: number;
	time_left: number;

	localPlayer: PlayerState;
	enemyPlayer: PlayerState;

	gameOver: boolean;
}
