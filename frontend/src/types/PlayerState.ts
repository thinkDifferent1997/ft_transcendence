export interface PlayerState
{
	score: number;
	answered: boolean;
	totalTimeUsed: number;

	correctStreak: number;
	wrongStreak: number;

	hideAnswer: boolean;
	threeChoice: boolean;
	doublePoint: boolean;
}
