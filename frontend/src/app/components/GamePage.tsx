import {Clock, CheckCircle, ArrowLeft} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import BonusBar from "./BonusBar";
import GameSettings from "./GameSettings";
import type { GameState } from "../types/GameState";

export default function GamePage({
    game,
    selectedAnswer,
    revealed,
    onAnswer,
    onBack,
}: Props)



interface Props {
    game: GameState;
	waitingForOpponent: boolean;
    onAnswer: (answer: string) => void;
    onBack: () => void;
}

const MODE_CONFIG = {
  ai: { label: "", color: "from-purple-500 to-pink-500", opponent: true },
  party: { label: "", color: "from-orange-500 to-red-500", opponent: true },
  tournament: { label: "", color: "from-yellow-500 to-amber-500", opponent: false },
};

	export default function GamePage({
		game,
		onAnswer,
		onBack,
		waitingForOpponent,
	}: Props) {

	const currentQ = game.currentQuestion;

	const config =
		MODE_CONFIG[game.mode as keyof typeof MODE_CONFIG];

	const hasOpponent = config.opponent;
	const [theme, setTheme] = useState(
		localStorage.getItem("game-theme") ?? "default",
	);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const [musicEnabled, setMusicEnabled] = useState(
		localStorage.getItem("music-enabled") !== "false",
	);

	const [volume, setVolume] = useState(
		Number(localStorage.getItem("music-volume") ?? 50),
	);

	useEffect(() =>
	{
		audioRef.current = new Audio("/music/forest_river_spirits.mp3");

		audioRef.current.loop = true;

		audioRef.current.volume = 0.5;

		if (musicEnabled)
		{
			audioRef.current.play().catch(() =>
			{
				console.log("Autoplay blocked.");
			});
		}

		return () =>
		{
			audioRef.current?.pause();
			audioRef.current = null;
		};
	}, []);

	useEffect(() =>
	{
		if (!audioRef.current)
			return;

		if (musicEnabled)
			audioRef.current.play();
		else
			audioRef.current.pause();

		localStorage.setItem(
			"music-enabled",
			String(musicEnabled),
		);
	}, [musicEnabled]);

	useEffect(() =>
	{
		if (!audioRef.current)
			return;

		audioRef.current.volume = volume / 100;

		localStorage.setItem(
			"music-volume",
			String(volume),
		);
	}, [volume]);

	if (!currentQ) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				Waiting for question...
			</div>
		);
	}

  const timerPct = (game.time_left / 20) * 100;
  const timerColor =
	  game.time_left > 15
		? "from-green-400 to-cyan-400"
		: game.time_left > 7
	  ? "from-yellow-400 to-orange-400"
	  : "from-red-400 to-pink-400";
	
	const backgrounds = {
		default: "bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900",

		forest: "bg-gradient-to-br from-green-900 via-emerald-800 to-lime-900",

		space: "bg-gradient-to-br from-slate-950 via-indigo-950 to-black",

		neon: "bg-gradient-to-br from-fuchsia-700 via-pink-700 to-cyan-600",
	};

  return (
	  <div className={`min-h-screen ${backgrounds[theme as keyof typeof backgrounds]} flex flex-col transition-all duration-500`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Leave</span>
        </button>
			<div className="flex items-center gap-4">
				<div className="text-white/70 text-sm">
					{game.questionIndex} / 8
				</div>
				<GameSettings
					theme={theme}
					setTheme={setTheme}
					musicEnabled={musicEnabled}
					setMusicEnabled={setMusicEnabled}
					volume={volume}
					setVolume={setVolume}
				/>

			</div>
      </div>

      {/* Score bar (opponent game.mode) */}
      {hasOpponent && (
        <div className="flex items-center justify-center gap-8 px-6 pb-2">
          {/* Player */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl">
              😊
            </div>
            <div className="text-right">
              <div className="text-white text-sm">{game.localPlayer.username}</div>
              <div className="text-white">{game.localPlayer.score}</div>
            </div>
          </div>
          <div className="text-white/40 text-xl">VS</div>
          {/* Opponent */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white text-sm">{game.mode === "ai" ? "Emilien" : game.enemyPlayer.username}</div>
              <div className="text-white">{game.enemyPlayer.score}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
              {game.mode === "ai" ? "🤖" : "🎮"}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full">
     
	  {/* Timer */}
		<BonusBar
			streak={game.localPlayer.streak}
			threeChoice={game.localPlayer.threeChoice}
			hideAnswer={game.localPlayer.hideAnswer}
			doublePoint={game.localPlayer.doublePoint}
		/>
		{!waitingForOpponent && (
		<>
			{/* Timer */}
			<div className="w-full mb-6">
				<div className="flex items-center justify-between mb-2">
					<div
						className={`flex items-center gap-2 text-sm ${
							game.time_left <= 7
								? "text-red-300 animate-pulse"
								: "text-white/70"
						}`}
					>
						<Clock className="w-4 h-4" />
						<span>{game.time_left}s</span>
					</div>

					{hasOpponent && game.enemyPlayer.answered && (
						<div className="flex items-center gap-2 text-amber-300 text-sm animate-pulse">
							<CheckCircle className="w-4 h-4" />
							<span>
								{game.mode === "ai"
									? "Emilien"
									: game.enemyPlayer.username}{" "}
								answered!
							</span>
						</div>
					)}

					{hasOpponent && !game.enemyPlayer.answered && (
						<div className="flex items-center gap-2 text-white/40 text-sm">
							<div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
							<span>
								{game.mode === "ai"
									? "Emilien"
									: game.enemyPlayer.username}{" "}
								is thinking...
							</span>
						</div>
					)}
				</div>

				<div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
					<div
						className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000`}
						style={{ width: `${timerPct}%` }}
					/>
				</div>
			</div>
		</>
	)}


        {/* Category + difficulty */}
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs">
            {currentQ.category}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs ${
              currentQ.difficulty === "easy"
                ? "bg-green-500/20 text-green-300"
                : currentQ.difficulty === "medium"
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {currentQ.difficulty}
          </span>
        </div>

       {waitingForOpponent ? (

  <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl flex flex-col items-center">


    <h2 className="text-3xl font-bold text-white mb-3">
      Answer submitted!
    </h2>

    <p className="text-white/70 text-lg mb-8">
      Waiting for your opponent...
    </p>

    <div className="flex gap-3 mb-8">
      <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce"></div>
      <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce delay-150"></div>
      <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce delay-300"></div>
    </div>

  </div>

) : (

  <>
    {/* Question */}
    <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
      <p className="text-white text-center leading-relaxed">
        {currentQ.question}
      </p>
    </div>

    {/* Answers */}
    <div
      className={`w-full grid gap-4 ${
        currentQ.type === "boolean"
          ? "grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {currentQ.answers.map((answer, idx) => {
        const isCorrect = idx === currentQ.correctIndex;

        let bg =
          "bg-white/10 hover:bg-white/20 border-white/20 text-white";

        if (game.localPlayer.answered) {
          if (isCorrect)
            bg = "bg-green-500/40 border-green-400 text-green-100";
          else
            bg = "bg-white/5 border-white/10 text-white/30";
        }

        return (
          <button
            key={idx}
            onClick={() => onAnswer(answer.value)}
            disabled={game.localPlayer.answered}
            className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${bg} ${
              !game.localPlayer.answered
                ? "cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                : "cursor-default"
            }`}
          >
            <div className="flex items-center gap-3">

              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>

              <span className="leading-snug">
                {answer.label}
              </span>

            </div>
          </button>
        );
      })}
    </div>
  </>

)}
		{/* Solo score */}
        {!hasOpponent && (
          <div className="mt-6 text-white/50 text-sm">
            Score : <span className="text-white">{game.localPlayer.score}</span> / {currentIndex}
          </div>
        )}
      </div>
    </div>
  );
}
