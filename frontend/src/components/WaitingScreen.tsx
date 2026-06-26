import ScoreBoard from "./ScoreBoard";

type WaitingScreenProps = 
{
	score: number,
	enemyScore: number,
	time_left: number,
};

export default function WaitingScreen
(
	{
		score,
		enemyScore,
		time_left,
	}: WaitingScreenProps
)

{
	return (
		<div>
			<ScoreBoard
				score = {score}
				enemyScore = {enemyScore}
				time_left = {time_left}
			/>
		</div>
	);
}
