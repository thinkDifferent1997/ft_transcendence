import { Trophy, LoaderCircle, Swords } from "lucide-react";

interface TournamentWaitingFinalProps {
	opponentReady: boolean;
}

export default function TournamentWaitingFinal({
	opponentReady,
}: TournamentWaitingFinalProps)
{
	return (
		<div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center px-6">

			<div
				className="
					w-full
					max-w-2xl
					rounded-3xl
					border border-white/15
					bg-white/10
					backdrop-blur-xl
					shadow-2xl
					p-10
				"
			>

				<div className="flex justify-center">
					<Trophy
						size={80}
						className="text-yellow-300 drop-shadow-lg"
					/>
				</div>

				<h1 className="mt-6 text-center text-4xl font-bold text-white">
					Congratulations!
				</h1>

				<p className="mt-3 text-center text-lg text-violet-200">
					You are the first finalist!
				</p>

				<div className="my-8 h-px bg-white/10" />

				{
					!opponentReady ? (
						<div className="flex flex-col items-center">

							<LoaderCircle
								size={48}
								className="animate-spin text-violet-300"
							/>

							<h2 className="mt-6 text-2xl font-semibold text-white">
								Waiting for your opponent...
							</h2>

							<p className="mt-3 text-center text-violet-200 max-w-md">
								The second semifinal is still being played.
								<br />
								Please wait while your opponent is decided.
							</p>

						</div>
					) : (
						<div className="flex flex-col items-center">

							<Swords
								size={48}
								className="text-yellow-300"
							/>

							<h2 className="mt-6 text-2xl font-semibold text-white">
								Opponent found!
							</h2>

							<p className="mt-3 text-center text-violet-200 max-w-md">
								The second finalist has been decided.
								<br />
								The Grand Final will begin in a few seconds...
							</p>

						</div>
					)
				}

			</div>

		</div>
	);
}
