export interface PlayerStats
{
	gamesPlayed: number;
	tournamentsWin: number;
	totalCorrectAnswers: number;
	averageAnswerTime: number;

	correctAnsewer_categories: Record<string, number>;
}
