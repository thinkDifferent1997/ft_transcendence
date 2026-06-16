import type { PlayerState } from "./PlayerState";

export interface GameState
{
	score: number;
	questionID: number;
	time_left: number;

	player1: PlayerState;
	player2: PlayerState;

	gameOver: boolean;
}
