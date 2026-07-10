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

interface Props {
  mode: GameMode;
  onBack: () => void;
}

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 30;
const OPPONENT_ANSWER_DELAY_MIN = 4000;
const OPPONENT_ANSWER_DELAY_MAX = 18000;

function decodeHTML(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShuffled(q: Question): ShuffledQuestion {
  const all = shuffleArray([q.correct_answer, ...q.incorrect_answers]);
  return {
    question: decodeHTML(q.question),
    answers: all.map(decodeHTML),
    correctIndex: all.indexOf(q.correct_answer),
    category: decodeHTML(q.category),
    difficulty: q.difficulty,
    type: q.type,
  };
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

export default function GamePage({ mode, onBack }: Props) {
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState<(number | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = MODE_CONFIG[mode];
  const hasOpponent = config.opponent;
  const currentQ = questions[currentIndex];

  // Load questions from API
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(
          `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&type=multiple`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setQuestions(data.results.map(buildShuffled));
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch {
        setQuestions(FALLBACK_QUESTIONS);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  const advanceQuestion = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_QUESTIONS) {
        setGameOver(true);
        return prev;
      }
      return next;
    });
    setSelectedAnswer(null);
    setRevealed(false);
    setOpponentAnswered(false);
    setTimeLeft(QUESTION_TIME);
  }, []);

  const revealAndScheduleNext = useCallback(
    (chosenIndex: number | null, forceCorrect = false) => {
      if (revealed) return;
      setRevealed(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);

      const isCorrect =
        forceCorrect ||
        (chosenIndex !== null && chosenIndex === currentQ?.correctIndex);
      if (isCorrect) setPlayerScore((s) => s + 1);
      setPlayerAnswers((prev) => [...prev, chosenIndex]);

      setTimeout(advanceQuestion, 2000);
    },
    [revealed, currentQ, advanceQuestion]
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (revealed || selectedAnswer !== null) return;
      setSelectedAnswer(idx);
      revealAndScheduleNext(idx);
    },
    [revealed, selectedAnswer, revealAndScheduleNext]
  );

  // Timer
  useEffect(() => {
    if (loading || gameOver || revealed || !currentQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          revealAndScheduleNext(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, loading, gameOver, revealed, currentQ, revealAndScheduleNext]);

  // Opponent behaviour (simulate)
  useEffect(() => {
    if (!hasOpponent || loading || gameOver || revealed) return;
    const delay =
      OPPONENT_ANSWER_DELAY_MIN +
      Math.random() * (OPPONENT_ANSWER_DELAY_MAX - OPPONENT_ANSWER_DELAY_MIN);

    opponentTimerRef.current = setTimeout(() => {
      if (!revealed) {
        setOpponentAnswered(true);
        const correct = Math.random() < 0.6;
        if (correct) setOpponentScore((s) => s + 1);
        // Reduce timer to 5s
        setTimeLeft((t) => Math.min(t, 5));
      }
    }, delay);

    return () => {
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    };
  }, [currentIndex, hasOpponent, loading, gameOver, revealed]);

  // Reset timer when opponent answered and timeLeft goes to 5
  useEffect(() => {
    if (opponentAnswered && timeLeft === 5 && !revealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            revealAndScheduleNext(null);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
  }, [opponentAnswered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 animate-spin">
            <Sparkles className="w-8 h-8" />
          </div>
          <p>Chargement des questions…</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <ResultsScreen
        mode={mode}
        playerScore={playerScore}
        opponentScore={opponentScore}
        questions={questions}
        playerAnswers={playerAnswers}
        onBack={onBack}
      />
    );
  }

  if (!currentQ) return null;

  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor =
    timeLeft > 15 ? "from-green-400 to-cyan-400" : timeLeft > 7 ? "from-yellow-400 to-orange-400" : "from-red-400 to-pink-400";

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
          {currentIndex + 1} / {TOTAL_QUESTIONS}
        </div>
      </div>

      {/* Score bar (opponent mode) */}
      {hasOpponent && (
        <div className="flex items-center justify-center gap-8 px-6 pb-2">
          {/* Player */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl">
              😊
            </div>
            <div className="text-right">
              <div className="text-white text-sm">Vous</div>
              <div className="text-white">{playerScore}</div>
            </div>
          </div>
          <div className="text-white/40 text-xl">VS</div>
          {/* Opponent */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white text-sm">{mode === "ai" ? "Emilien" : "Alex"}</div>
              <div className="text-white">{opponentScore}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
              {mode === "ai" ? "🤖" : "🎮"}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full">
        {/* Timer */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 text-sm ${timeLeft <= 7 ? "text-red-300 animate-pulse" : "text-white/70"}`}>
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
            {hasOpponent && opponentAnswered && (
              <div className="flex items-center gap-2 text-amber-300 text-sm animate-pulse">
                <CheckCircle className="w-4 h-4" />
                <span>{mode === "ai" ? "Emilien" : "Alex"} a répondu !</span>
              </div>
            )}
            {hasOpponent && !opponentAnswered && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <span>{mode === "ai" ? "Emilien" : "Alex"} réfléchit…</span>
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

        {/* Question */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <p className="text-white text-center leading-relaxed">
            {currentQ.question}
          </p>
        </div>

        {/* Answers */}
        <div
          className={`w-full grid gap-4 ${
            currentQ.type === "boolean" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {currentQ.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQ.correctIndex;
            let bg = "bg-white/10 hover:bg-white/20 border-white/20 text-white";
            if (revealed) {
              if (isCorrect) bg = "bg-green-500/40 border-green-400 text-green-100";
              else if (isSelected) bg = "bg-red-500/40 border-red-400 text-red-100";
              else bg = "bg-white/5 border-white/10 text-white/30";
            } else if (isSelected) {
              bg = "bg-white/30 border-white text-white";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={revealed}
                className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 ${bg} ${
                  !revealed ? "cursor-pointer hover:-translate-y-0.5 active:translate-y-0" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{answer}</span>
                  {revealed && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />
                  )}
                  {revealed && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Solo score */}
        {!hasOpponent && (
          <div className="mt-6 text-white/50 text-sm">
            Score : <span className="text-white">{playerScore}</span> / {currentIndex}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results ────────────────────────────────────────────────────────────────

interface ResultsProps {
  mode: GameMode;
  playerScore: number;
  opponentScore: number;
  questions: ShuffledQuestion[];
  playerAnswers: (number | null)[];
  onBack: () => void;
}

function ResultsScreen({ mode, playerScore, opponentScore, questions, playerAnswers, onBack }: ResultsProps) {
  const config = MODE_CONFIG[mode];
  const hasOpponent = config.opponent;
  const opponentName = mode === "ai" ? "Emilien" : "Alex";

  const playerWon = hasOpponent ? playerScore > opponentScore : true;
  const isDraw = hasOpponent && playerScore === opponentScore;

  const bracket = mode === "tournament" ? buildTournamentBracket(playerScore) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-start py-10 px-4">
      {/* Winner banner */}
      {mode !== "tournament" && (
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
      {mode === "tournament" && bracket && (
        <TournamentBracket bracket={bracket} playerScore={playerScore} />
      )}

      {/* Score cards */}
      {hasOpponent && (
        <div className="flex gap-6 mb-8">
          <ScoreCard name="Vous" score={playerScore} emoji="😊" winner={!isDraw && playerWon} />
          <ScoreCard name={opponentName} score={opponentScore} emoji={mode === "ai" ? "🤖" : "🎮"} winner={!isDraw && !playerWon} />
        </div>
      )}

      {!hasOpponent && (
        <div className="mb-8 text-center">
          <div className="text-6xl mb-2 text-white">{playerScore}/{TOTAL_QUESTIONS}</div>
          <p className="text-white/60">
            {playerScore >= 8 ? "Excellent ! Tu es un pro !" : playerScore >= 5 ? "Pas mal, continue !" : "Tu peux faire mieux !"}
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

function ScoreCard({ name, score, emoji, winner }: { name: string; score: number; emoji: string; winner: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border-2 transition-all ${
        winner
          ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
          : "border-white/20 bg-white/5"
      }`}
    >
      {winner && <Crown className="w-5 h-5 text-yellow-400" />}
      <div className="text-4xl">{emoji}</div>
      <div className="text-white">{name}</div>
      <div className={`text-3xl ${winner ? "text-yellow-400" : "text-white"}`}>{score}</div>
    </div>
  );
}

interface BracketData {
  qf: { p1: { name: string; score: number; isPlayer: boolean }; p2: { name: string; score: number; isPlayer: boolean }; winner: { name: string; isPlayer: boolean } }[];
  sf: { p1: { name: string; score: number; isPlayer: boolean }; p2: { name: string; score: number; isPlayer: boolean }; winner: { name: string; isPlayer: boolean } }[];
  final: { p1: { name: string; score: number; isPlayer: boolean }; p2: { name: string; score: number; isPlayer: boolean }; winner: { name: string; isPlayer: boolean } };
}

function TournamentBracket({ bracket, playerScore }: { bracket: BracketData; playerScore: number }) {
  return (
    <div className="w-full max-w-4xl mb-8">
      <h2 className="text-white text-center mb-6 flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Bracket du tournoi
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-4">
        {/* Quarter Finals */}
        <div className="flex flex-col justify-around gap-4 min-w-[160px]">
          <div className="text-white/40 text-xs text-center mb-2">Quarts</div>
          {bracket.qf.map((match, i) => (
            <MatchCard key={i} p1={match.p1} p2={match.p2} winner={match.winner} />
          ))}
        </div>
        {/* Connector */}
        <div className="flex flex-col justify-around items-center min-w-[24px]">
          {[0, 1].map((i) => (
            <div key={i} className="w-6 h-24 border-r-2 border-t-2 border-b-2 border-white/20 rounded-r-lg" />
          ))}
        </div>
        {/* Semi Finals */}
        <div className="flex flex-col justify-around gap-8 min-w-[160px]">
          <div className="text-white/40 text-xs text-center mb-2">Demis</div>
          {bracket.sf.map((match, i) => (
            <MatchCard key={i} p1={match.p1} p2={match.p2} winner={match.winner} />
          ))}
        </div>
        {/* Connector */}
        <div className="flex flex-col justify-around items-center min-w-[24px]">
          <div className="w-6 h-24 border-r-2 border-t-2 border-b-2 border-white/20 rounded-r-lg" />
        </div>
        {/* Final */}
        <div className="flex flex-col justify-center min-w-[160px]">
          <div className="text-white/40 text-xs text-center mb-2">Finale</div>
          <MatchCard p1={bracket.final.p1} p2={bracket.final.p2} winner={bracket.final.winner} isFinal />
        </div>
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
