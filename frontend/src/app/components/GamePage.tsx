export default function GamePage({
    game,
    selectedAnswer,
    revealed,
    onAnswer,
    onBack,
}: Props)

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Bot,
  Users,
  User,
  ArrowLeft,
  Star,
  Crown,
  Zap,
} from "lucide-react";

import BonusBar from "./BonusBar";

type GameMode = "solo" | "ai" | "party" | "tournament";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  type: "multiple" | "boolean";
  category: string;
  difficulty: string;
}

interface ShuffledQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
  type: "multiple" | "boolean";
}

import type { GameState } from "../types/GameState";
import type { Question } from "../types/question";

interface Props {
    game: GameState;
	selectedAnswer: string | null;
    revealed: boolean;
	waitingForOpponent: boolean;
    onAnswer: (answer: string) => void;
    onBack: () => void;
}

// Mock fallback questions in case API fails
const FALLBACK_QUESTIONS: ShuffledQuestion[] = [
  {
    question: "Quelle est la capitale de la France ?",
    answers: ["Paris", "Lyon", "Marseille", "Bordeaux"],
    correctIndex: 0,
    category: "Géographie",
    difficulty: "easy",
    type: "multiple",
  },
  {
    question: "Qui a peint la Joconde ?",
    answers: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"],
    correctIndex: 2,
    category: "Art",
    difficulty: "easy",
    type: "multiple",
  },
  {
    question: "La Tour Eiffel a été construite en 1889.",
    answers: ["Vrai", "Faux"],
    correctIndex: 0,
    category: "Histoire",
    difficulty: "easy",
    type: "boolean",
  },
  {
    question: "Combien de planètes y a-t-il dans le système solaire ?",
    answers: ["7", "8", "9", "10"],
    correctIndex: 1,
    category: "Science",
    difficulty: "easy",
    type: "multiple",
  },
  {
    question: "Quel est le plus grand océan du monde ?",
    answers: ["Atlantique", "Indien", "Arctique", "Pacifique"],
    correctIndex: 3,
    category: "Géographie",
    difficulty: "easy",
    type: "multiple",
  },
  {
    question: "Qui a écrit 'Les Misérables' ?",
    answers: ["Honoré de Balzac", "Victor Hugo", "Émile Zola", "Gustave Flaubert"],
    correctIndex: 1,
    category: "Littérature",
    difficulty: "medium",
    type: "multiple",
  },
  {
    question: "Le soleil est une étoile.",
    answers: ["Vrai", "Faux"],
    correctIndex: 0,
    category: "Science",
    difficulty: "easy",
    type: "boolean",
  },
  {
    question: "Dans quel pays se trouve le Mont Everest ?",
    answers: ["Inde", "Tibet", "Népal", "Bhoutan"],
    correctIndex: 2,
    category: "Géographie",
    difficulty: "medium",
    type: "multiple",
  },
  {
    question: "Quelle est la formule chimique de l'eau ?",
    answers: ["CO2", "H2O2", "O2", "H2O"],
    correctIndex: 3,
    category: "Science",
    difficulty: "easy",
    type: "multiple",
  },
  {
    question: "Qui a composé la 9ème symphonie ?",
    answers: ["Mozart", "Beethoven", "Bach", "Chopin"],
    correctIndex: 1,
    category: "Musique",
    difficulty: "medium",
    type: "multiple",
  },
];

const MODE_CONFIG = {
  solo: { label: "Solo", color: "from-blue-500 to-cyan-500", opponent: false, icon: User },
  ai: { label: "1v1 AI — Emilien", color: "from-purple-500 to-pink-500", opponent: true, icon: Bot },
  party: { label: "1v1 Party", color: "from-orange-500 to-red-500", opponent: true, icon: Users },
  tournament: { label: "Tournoi", color: "from-yellow-500 to-amber-500", opponent: false, icon: Trophy },
};

// Tournament bracket helpers
function buildTournamentBracket(playerScore: number) {
  const players = [
    { name: "Vous", score: playerScore, isPlayer: true },
    { name: "Alex", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Sam", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Jordan", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Emilien", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Robin", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Casey", score: Math.floor(Math.random() * 11), isPlayer: false },
    { name: "Morgan", score: Math.floor(Math.random() * 11), isPlayer: false },
  ];

  const qf = [
    { p1: players[0], p2: players[1], winner: players[0].score >= players[1].score ? players[0] : players[1] },
    { p1: players[2], p2: players[3], winner: players[2].score >= players[3].score ? players[2] : players[3] },
    { p1: players[4], p2: players[5], winner: players[4].score >= players[5].score ? players[4] : players[5] },
    { p1: players[6], p2: players[7], winner: players[6].score >= players[7].score ? players[6] : players[7] },
  ];

  const sf = [
    { p1: qf[0].winner, p2: qf[1].winner, winner: qf[0].winner.score >= qf[1].winner.score ? qf[0].winner : qf[1].winner },
    { p1: qf[2].winner, p2: qf[3].winner, winner: qf[2].winner.score >= qf[3].winner.score ? qf[2].winner : qf[3].winner },
  ];

  const final = {
    p1: sf[0].winner,
    p2: sf[1].winner,
    winner: sf[0].winner.score >= sf[1].winner.score ? sf[0].winner : sf[1].winner,
  };

  return { qf, sf, final };
}

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

	if (!currentQ) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				Waiting for question...
			</div>
		);
	}

  if (!currentQ) return null;

  const timerPct = (game.time_left / 20) * 100;
  const timerColor =
	  game.time_left > 15
		? "from-green-400 to-cyan-400"
		: game.time_left > 7
	  ? "from-yellow-400 to-orange-400"
	  : "from-red-400 to-pink-400";

	console.log(game.questionIndex);
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quitter</span>
        </button>
        <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${config.color} text-white text-sm`}>
          {config.label}
        </div>
        <div className="text-white/70 text-sm">
          {game.questionIndex} / 8
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
              <div className="text-white text-sm">Vous</div>
              <div className="text-white">{game.localPlayer.score}</div>
            </div>
          </div>
          <div className="text-white/40 text-xl">VS</div>
          {/* Opponent */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white text-sm">{game.mode === "ai" ? "Emilien" : "Alex"}</div>
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
									: "Alex"}{" "}
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
									: "Alex"}{" "}
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

// ─── Results ────────────────────────────────────────────────────────────────


function ResultsScreen({ mode, playerScore, opponentScore, questions, playerAnswers, onBack }: ResultsProps) {
  const config = MODE_CONFIG[game.mode];
  const hasOpponent = config.opponent;
  const opponentName = game.mode === "ai" ? "Emilien" : "Alex";

  const playerWon = hasOpponent ? game.localPlayer.score > game.enemyPlayer.score : true;
  const isDraw = hasOpponent && game.localPlayer.score === game.enemyPlayer.score;

  const bracket = game.mode === "tournament" ? buildTournamentBracket(game.localPlayer.score) : null;


  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-start py-10 px-4">
      {/* Winner banner */}
      {game.mode !== "tournament" && (
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-yellow-500/30">
            {isDraw ? (
              <Zap className="w-12 h-12 text-white" />
            ) : playerWon ? (
              <Crown className="w-12 h-12 text-white" />
            ) : (
              <Star className="w-12 h-12 text-white" />
            )}
          </div>
          <h2 className="text-white mb-2">
            {isDraw ? "Égalité !" : playerWon ? "Victoire ! 🎉" : "Défaite…"}
          </h2>
          {hasOpponent && (
            <p className="text-white/60">
              {isDraw
                ? "Vous êtes à égalité !"
                : playerWon
                ? `Vous avez battu ${opponentName} !`
                : `${opponentName} vous a battu !`}
            </p>
          )}
        </div>
      )}

      {/* Tournament bracket */}
      {game.mode === "tournament" && bracket && (
        <TournamentBracket bracket={bracket} playerScore={game.localPlayer.score} />
      )}

      {/* Score cards */}
      {hasOpponent && (
        <div className="flex gap-6 mb-8">
          <ScoreCard name="Vous" score={game.localPlayer.score} emoji="😊" winner={!isDraw && playerWon} />
          <ScoreCard name={opponentName} score={game.enemyPlayer.score} emoji={game.mode === "ai" ? "🤖" : "🎮"} winner={!isDraw && !playerWon} />
        </div>
      )}

      {!hasOpponent && (
        <div className="mb-8 text-center">
          <div className="text-6xl mb-2 text-white">{game.localPlayer.score}/8</div>
          <p className="text-white/60">
            {game.localPlayer.score >= 8 ? "Excellent ! Tu es un pro !" : game.localPlayer.score >= 5 ? "Pas mal, continue !" : "Tu peux faire mieux !"}
          </p>
        </div>
      )}

      {/* Question review */}
      <div className="w-full max-w-2xl mb-8">
        <h3 className="text-white/70 text-sm mb-3">Récapitulatif</h3>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const playerCorrect = playerAnswers[i] === q.correctIndex;
            return (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-shrink-0 mt-0.5">
                  {playerCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{q.question}</p>
                  <p className="text-green-400 text-xs mt-0.5">✓ {q.answers[q.correctIndex]}</p>
                </div>
                <span className="text-xs text-white/30 flex-shrink-0">#{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <button
          onClick={() => window.location.reload()}
          className={`flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${config.color} text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
        >
          <Sparkles className="w-5 h-5" />
          Rejouer
        </button>
      </div>
    </div>
  );
}

function MatchCard({
  p1, p2, winner, isFinal = false,
}: {
  p1: { name: string; score: number; isPlayer: boolean };
  p2: { name: string; score: number; isPlayer: boolean };
  winner: { name: string; isPlayer: boolean };
  isFinal?: boolean;
}) {
  return (
    <div className={`rounded-xl border overflow-hidden ${isFinal ? "border-yellow-400/50 shadow-lg shadow-yellow-400/10" : "border-white/20"}`}>
      {[p1, p2].map((p, i) => {
        const isWinner = p.name === winner.name;
        return (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 text-sm ${
              isWinner
                ? "bg-yellow-400/20 text-yellow-300"
                : "bg-white/5 text-white/40"
            } ${p.isPlayer ? "font-semibold" : ""}`}
          >
            <span className="flex items-center gap-1">
              {isWinner && isFinal && <Crown className="w-3 h-3" />}
              {p.name}
            </span>
            <span>{p.score}</span>
          </div>
        );
      })}
    </div>
  );
}
