type ScoreBoardProps = 
	{
		score: number;
		enemyScore: number;
		time_left: number;
	};

export default function ScoreBoard
(
	{
		score,
		enemyScore,
		time_left,
	}: ScoreBoardProps
)
{
	return (
		<p>
			Score : {score} - {enemyScore}
			{"\n"}
			Time left : {time_left}
		</p>
	);
}
