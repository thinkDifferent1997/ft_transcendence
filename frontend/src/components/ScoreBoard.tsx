type ScoreBoardProps = 
	{
		score: number;
		time_left: number;
	};

export default function ScoreBoard
(
	{
		score,
		time_left,
	}: ScoreBoardProps
)
{
	return (
		<p>
			Score :{score}
			{" "}
			Time left : {time_left}
		</p>
	);
}
