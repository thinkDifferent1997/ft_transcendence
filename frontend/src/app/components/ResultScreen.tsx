import {
    Trophy,
    XCircle,
    CheckCircle,
    Home,
    RotateCcw,
} from "lucide-react";

import type { GameState } from "../types/GameState";

interface Props {
    game: GameState;
    onBack: () => void;
    onReplay?: () => void;
}

export default function ResultsScreen({
    game,
    onBack,
    onReplay,
}: Props) {

	const victory =
		game.isPlayer1
			? game.winner === 1
			: game.winner === 2;

	const draw =
		game.winner === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center px-6 py-10">

            <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">

                {/* Header */}

                <div className="text-center mb-10">

                    <div className="flex justify-center mb-6">

                        <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center ${
                                draw
                                    ? "bg-gray-500/20"
                                    : victory
                                    ? "bg-yellow-400/20"
                                    : "bg-red-500/20"
                            }`}
                        >
                            <Trophy
                                className={`w-12 h-12 ${
                                    draw
                                        ? "text-gray-300"
                                        : victory
                                        ? "text-yellow-300"
                                        : "text-red-300"
                                }`}
                            />
                        </div>

                    </div>

                    <h1
                        className={`text-5xl font-black mb-3 ${
                            draw
                                ? "text-gray-200"
                                : victory
                                ? "text-yellow-300"
                                : "text-red-300"
                        }`}
                    >
                        {draw
                            ? "DRAW"
                            : victory
                            ? "VICTORY"
                            : "DEFEAT"}
                    </h1>

                    <div className="text-4xl font-bold text-white">
                        {game.localPlayer.score}
                        {"  "}
                        -
                        {"  "}
                        {game.enemyPlayer.score}
                    </div>

                </div>

                {/* Questions */}

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">

                    {game.answeredQuestions.map((entry, index) => (

                        <div
                            key={index}
                            className="rounded-2xl bg-white/5 border border-white/10 p-5"
                        >

                            <h3 className="text-white font-semibold mb-4">
                                Question {index + 1}
                            </h3>

                            <p className="text-white/90 mb-5">
                                {entry.question.question}
                            </p>

							{entry.correct ? (
								<div className="flex items-center gap-3 text-green-300">
									<CheckCircle className="w-5 h-5" />

									<span>
										<span className="font-semibold">
											Your answer:
										</span>{" "}
										{entry.playerAnswer}
									</span>
								</div>
							) : (
								<>
									<div className="flex items-center gap-3 mb-2 text-red-300">
										<XCircle className="w-5 h-5" />

										<span>
											<span className="font-semibold">
												Your answer:
											</span>{" "}
											{entry.playerAnswer ?? "No answer"}
										</span>
									</div>

									<div className="flex items-center gap-3 text-green-300">
										<CheckCircle className="w-5 h-5" />

										<span>
											<span className="font-semibold">
												Correct answer:
											</span>{" "}
											{entry.question.correct}
										</span>
									</div>
								</>
							)}

                        </div>

                    ))}

                </div>

                {/* Buttons */}

                <div className="flex justify-center gap-4 mt-10">

                    {onReplay && (
                        <button
                            onClick={onReplay}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white transition"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Play Again
                        </button>
                    )}

                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                    >
                        <Home className="w-5 h-5" />
                        Back to Lobby
                    </button>

                </div>

            </div>

        </div>
    );
}
