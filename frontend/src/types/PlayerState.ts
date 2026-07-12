export interface PlayerState
{
	score: number;
	answered: boolean;
	totalTimeUsed: number;

	streak: number;

	hideAnswer: boolean;
	threeChoice: boolean;
	doublePoint: boolean;
//	hiddenAnswerIndex: number;
}
