import { Trophy, Clock } from "lucide-react";

interface BracketPlayer {
    id: string;
    username: string;
}

interface BracketMatch {
    player1: BracketPlayer;
    player2: BracketPlayer;
    winner?: BracketPlayer;
}

interface TournamentBracketData {
    semiFinal1?: BracketMatch;
    semiFinal2?: BracketMatch;
}

interface Props {
    bracket: TournamentBracketData;
    timer: number;
}

interface MatchCardProps {
    title: string;
    player1?: BracketPlayer;
    player2?: BracketPlayer;
    winner?: BracketPlayer;
}

function MatchCard({
    title,
    player1,
    player2,
    winner,
}: MatchCardProps) {
    return (
        <div className="w-64 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl shadow-xl">

            <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-violet-200">
                {title}
            </div>

            <div className="space-y-3">

                <PlayerRow
                    player={player1}
                    winner={winner?.id === player1?.id}
                />

                <PlayerRow
                    player={player2}
                    winner={winner?.id === player2?.id}
                />

            </div>

        </div>
    );
}

interface PlayerRowProps {
    player?: BracketPlayer;
    winner?: boolean;
}

function PlayerRow({
    player,
    winner = false,
}: PlayerRowProps) {

    if (!player) {
        return (
            <div className="flex h-12 items-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 text-white/30">
                En attente...
            </div>
        );
    }

    return (
        <div
            className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-all duration-300
            ${
                winner
                    ? "border-yellow-400 bg-yellow-500/20"
                    : "border-white/10 bg-black/20"
            }`}
        >

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-bold
                    ${
                        winner
                            ? "bg-yellow-400 text-black"
                            : "bg-violet-500 text-white"
                    }`}
                >
                    {player.username.charAt(0).toUpperCase()}
                </div>

                <span
                    className={`font-medium ${
                        winner
                            ? "text-yellow-200"
                            : "text-white"
                    }`}
                >
                    {player.username}
                </span>

            </div>

            {winner && (
                <div className="text-xl">
                    👑
                </div>
            )}

        </div>
    );
}

function FinalPlayer({
    player,
}: {
    player?: BracketPlayer;
}) {

    if (!player)
    {
        return (
            <div className="flex flex-col items-center gap-2 opacity-30">
                <div className="h-14 w-14 rounded-full bg-white/10" />
                <span className="text-white">
                    ?
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xl font-bold text-black shadow-lg">

                {player.username.charAt(0).toUpperCase()}

            </div>

            <span className="font-semibold text-white">

                {player.username}

            </span>

        </div>
    );
}

export default function TournamentBracket({
    bracket,
    timer,
}: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 flex items-center justify-center p-8">

            <div className="relative w-full max-w-5xl">

                <div className="mb-12 flex flex-col items-center">

                    <div className="flex items-center gap-3 text-yellow-400 mb-4">
                        <Trophy size={30}/>
                        <h1 className="text-3xl font-bold text-white">
                            Finale
                        </h1>
                    </div>

					<div className="rounded-2xl border border-yellow-400/30 bg-white/10 px-8 py-5 backdrop-blur-xl shadow-2xl">

						<div className="mb-5 text-center text-sm uppercase tracking-[0.25em] text-yellow-300">
							Finale
						</div>

						<div className="flex items-center justify-center gap-8">

							<FinalPlayer player={bracket.semiFinal1?.winner} />

							<div className="text-2xl text-yellow-400 font-bold">
								VS
							</div>

							<FinalPlayer player={bracket.semiFinal2?.winner} />

						</div>

					</div>

                </div>

				<svg
					className="absolute inset-0 h-full w-full pointer-events-none"
					viewBox="0 0 1000 700"
				>

					<defs>

						<linearGradient
							id="bracketLine"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop
								offset="0%"
								stopColor="#a855f7"
								stopOpacity="0.25"
							/>

							<stop
								offset="50%"
								stopColor="#ffffff"
								stopOpacity="0.55"
							/>

							<stop
								offset="100%"
								stopColor="#a855f7"
								stopOpacity="0.25"
							/>

						</linearGradient>

					</defs>

					{/* gauche */}

					<path
						d="
							M300 560
							L300 410
							L500 410
							L500 230
						"
						stroke="url(#bracketLine)"
						strokeWidth="4"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* droite */}

					<path
						d="
							M700 560
							L700 410
							L500 410
							L500 230
						"
						stroke="url(#bracketLine)"
						strokeWidth="4"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

				</svg>

                <div className="mt-48 flex justify-between px-12">

                    <MatchCard
                        title="Demi-finale"
                        player1={bracket.semiFinal1?.player1}
                        player2={bracket.semiFinal1?.player2}
                        winner={bracket.semiFinal1?.winner}
                    />

                    <MatchCard
                        title="Demi-finale"
                        player1={bracket.semiFinal2?.player1}
                        player2={bracket.semiFinal2?.player2}
                        winner={bracket.semiFinal2?.winner}
                    />

                </div>

            </div>

        </div>
    );
}
