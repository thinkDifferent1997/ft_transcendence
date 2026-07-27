import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TournamentWaitProps {
    players: string[];
    onBack: () => void;
}

export default function TournamentWait({
    players,
    onBack,
}: TournamentWaitProps)
{
	const slots = [...players];

	while (slots.length < 4)
		slots.push("");

	return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
			<div className="w-full max-w-3xl">

				{/* Back button */}

				<button
					onClick={onBack}
					className="
						mb-6
						flex items-center gap-2
						text-white/70
						hover:text-white
						transition"
				>
					<ArrowLeft size={20}/>
					Back
				</button>

				{/* Main panel */}

				<div
					className="
						bg-white/10
						backdrop-blur-md
						border border-white/20
						rounded-3xl
						p-8
						shadow-2xl">

					<h1 className="text-4xl font-bold text-center text-white">
						Tournament Lobby
					</h1>

					<p className="text-center text-white/70 mt-2">
						Waiting for players...
					</p>

					<div className="flex justify-center items-center gap-2 mt-8 mb-8">

						<Users className="text-cyan-400"/>

						<span className="text-2xl font-bold text-white">
							{players.length} / 4
						</span>

					</div>

					<div className="grid grid-cols-2 gap-5">

						{
							slots.map((player, index) => (

								<div
									key={index}
									className="
										h-20
										rounded-xl
										bg-white/5
										border border-white/10
										flex
										items-center
										justify-center
										text-lg
										font-semibold
										text-white">

									{
										player !== ""
											? player
											: (
												<span className="text-white/40">
													Waiting for player...
												</span>
											)
									}

								</div>

							))
						}

					</div>

					<p className="mt-8 text-center text-white/50 text-sm">
						The tournament will start automatically when four players have joined.
					</p>

				</div>

			</div>
		</div>
	);
}
