import ScoreBoard from "./ScoreBoard";

type WaitingScreenProps = 
{
	score,
	time_left,
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
				time_left = {time_left}
			/>

			<h1>Waiting for the opponent ...</h1>
		</div>
	);
}
