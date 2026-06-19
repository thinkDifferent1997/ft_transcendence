import ScoreBoard from "./ScoreBoard";

type WaitingScreenProps = 
{
	score: number,
	time_left: number,
};

export default function WaitingScreen
(
	{
		score,
		time_left,
	}: WaitingScreenProps
)

{
	return (
		<div>
			<ScoreBoard
				score = {score}
				enemyScore = {score}
				time_left = {time_left}
			/>

			<h1>Waiting for the opponent ...</h1>
		</div>
	);
}
