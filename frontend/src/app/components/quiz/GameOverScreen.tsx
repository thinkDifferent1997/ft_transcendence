type GameOverScreenProps =
{
	didWin: boolean,
	score: number,
	maxScore: number
};

export default function GameOverScreen
(
	{
		didWin,
		score,
		maxScore
	}: GameOverScreenProps
)

{
	return (
	<div>
		<h1>
			{didWin ? "Victory !"
			"Defeat."}
		</h1>
		<p>
			Final score : {score} / {maxScore}
		</p>
		</div>
	);
}
