export interface PlayerState
{
	username: string;
	score: number;
	answered: boolean;
	totalTimeUsed: number;

	streak: number;

	hideAnswer: boolean;
	threeChoice: boolean;
	doublePoint: boolean;
}
