import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Crown,
  Swords,
  Sparkles,
  Shield,
  Skull,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TPlayer {
  id: number;
  name: string;
  emoji: string;
  isHuman: boolean;
}

interface Match {
  id: string;
  p1: TPlayer;
  p2: TPlayer;
  winner: TPlayer | null;
  p1Score: number;
  p2Score: number;
}

interface Round {
  name: string;
  matches: Match[];
}

interface ShuffledQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  category: string;
  difficulty: string;
}

type Phase =
  | "bracket"       // show bracket before a round
  | "playing"       // human is playing their match
  | "simulating"    // other matches being simulated
  | "round-result"  // show round results
  | "eliminated"    // human lost
  | "champion";     // human won the whole thing

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeHTML(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK_QUESTIONS: ShuffledQuestion[] = [
  { question: "Quelle est la capitale de la France ?", answers: ["Paris", "Lyon", "Marseille", "Bordeaux"], correctIndex: 0, category: "Géographie", difficulty: "easy" },
  { question: "Qui a peint la Joconde ?", answers: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"], correctIndex: 2, category: "Art", difficulty: "easy" },
  { question: "Combien de planètes dans le système solaire ?", answers: ["7", "8", "9", "10"], correctIndex: 1, category: "Science", difficulty: "easy" },
  { question: "Quel est le plus grand océan ?", answers: ["Atlantique", "Indien", "Arctique", "Pacifique"], correctIndex: 3, category: "Géographie", difficulty: "easy" },
  { question: "Qui a écrit 'Les Misérables' ?", answers: ["Balzac", "Victor Hugo", "Zola", "Flaubert"], correctIndex: 1, category: "Littérature", difficulty: "medium" },
  { question: "En quelle année a eu lieu la Révolution française ?", answers: ["1776", "1789", "1804", "1815"], correctIndex: 1, category: "Histoire", difficulty: "medium" },
  { question: "Quelle est la formule chimique de l'eau ?", answers: ["CO2", "H2O2", "O2", "H2O"], correctIndex: 3, category: "Science", difficulty: "easy" },
  { question: "Qui a composé la 9ème symphonie ?", answers: ["Mozart", "Beethoven", "Bach", "Chopin"], correctIndex: 1, category: "Musique", difficulty: "medium" },
  { question: "Dans quel pays se trouve le Machu Picchu ?", answers: ["Brésil", "Chili", "Pérou", "Colombie"], correctIndex: 2, category: "Géographie", difficulty: "medium" },
  { question: "Quel est le symbole chimique de l'or ?", answers: ["Or", "Go", "Au", "Ag"], correctIndex: 2, category: "Science", difficulty: "easy" },
  { question: "Qui a écrit 'Don Quichotte' ?", answers: ["Lope de Vega", "Cervantes", "Calderón", "Góngora"], correctIndex: 1, category: "Littérature", difficulty: "hard" },
  { question: "Quelle planète est surnommée la planète rouge ?", answers: ["Vénus", "Jupiter", "Mars", "Saturne"], correctIndex: 2, category: "Science", difficulty: "easy" },
  { question: "En quelle année l'homme a-t-il marché sur la Lune ?", answers: ["1965", "1967", "1969", "1971"], correctIndex: 2, category: "Histoire", difficulty: "medium" },
  { question: "Quel est le plus long fleuve du monde ?", answers: ["Amazone", "Nil", "Mississippi", "Yangtsé"], correctIndex: 1, category: "Géographie", difficulty: "medium" },
  { question: "Qui a peint 'La Nuit étoilée' ?", answers: ["Monet", "Picasso", "Van Gogh", "Dalí"], correctIndex: 2, category: "Art", difficulty: "easy" },
  { question: "Combien de côtés a un hexagone ?", answers: ["5", "6", "7", "8"], correctIndex: 1, category: "Mathématiques", difficulty: "easy" },
  { question: "Quelle est la monnaie du Japon ?", answers: ["Won", "Yuan", "Yen", "Baht"], correctIndex: 2, category: "Économie", difficulty: "easy" },
  { question: "Qui a inventé le téléphone ?", answers: ["Edison", "Tesla", "Bell", "Marconi"], correctIndex: 2, category: "Science", difficulty: "medium" },
  { question: "En quelle année a été fondée l'ONU ?", answers: ["1942", "1945", "1948", "1950"], correctIndex: 1, category: "Histoire", difficulty: "hard" },
  { question: "Quel pays a la plus grande superficie ?", answers: ["Canada", "Chine", "USA", "Russie"], correctIndex: 3, category: "Géographie", difficulty: "easy" },
  { question: "Qui a théorisé la relativité générale ?", answers: ["Newton", "Bohr", "Einstein", "Planck"], correctIndex: 2, category: "Science", difficulty: "medium" },
  { question: "Quel est le capital de l'Australie ?", answers: ["Sydney", "Melbourne", "Brisbane", "Canberra"], correctIndex: 3, category: "Géographie", difficulty: "medium" },
  { question: "Combien d'os y a-t-il dans le corps humain adulte ?", answers: ["186", "196", "206", "216"], correctIndex: 2, category: "Science", difficulty: "hard" },
  { question: "Qui a peint le plafond de la Chapelle Sixtine ?", answers: ["Léonard de Vinci", "Raphaël", "Michel-Ange", "Botticelli"], correctIndex: 2, category: "Art", difficulty: "medium" },
  { question: "Quelle est la vitesse de la lumière (km/s) ?", answers: ["200 000", "300 000", "400 000", "500 000"], correctIndex: 1, category: "Science", difficulty: "medium" },
  { question: "Quel est le plus petit pays du monde ?", answers: ["Monaco", "Liechtenstein", "Vatican", "Saint-Marin"], correctIndex: 2, category: "Géographie", difficulty: "medium" },
  { question: "En quelle année fut construit le mur de Berlin ?", answers: ["1955", "1958", "1961", "1963"], correctIndex: 2, category: "Histoire", difficulty: "hard" },
  { question: "Qui a écrit 'Hamlet' ?", answers: ["Marlowe", "Shakespeare", "Jonson", "Webster"], correctIndex: 1, category: "Littérature", difficulty: "easy" },
  { question: "Quel élément chimique a pour symbole 'Fe' ?", answers: ["Fluor", "Fer", "Francium", "Fermium"], correctIndex: 1, category: "Science", difficulty: "medium" },
  { question: "Quelle est la capitale du Brésil ?", answers: ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília"], correctIndex: 3, category: "Géographie", difficulty: "medium" },
];

async function fetchQuestions(): Promise<ShuffledQuestion[]> {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&type=multiple`);
    const data = await res.json();
    if (data.results?.length > 0) {
      return data.results.map((q: { question: string; correct_answer: string; incorrect_answers: string[]; category: string; difficulty: string }) => {
        const all = shuffle([q.correct_answer, ...q.incorrect_answers]);
        return {
          question: decodeHTML(q.question),
          answers: all.map(decodeHTML),
          correctIndex: all.indexOf(q.correct_answer),
          category: decodeHTML(q.category),
          difficulty: q.difficulty,
        };
      });
    }
  } catch { /* fall through */ }
  return shuffle([...FALLBACK_QUESTIONS]).slice(0, TOTAL_QUESTIONS);
}

// ─── Build initial bracket ───────────────────────────────────────────────────

const BOTS: Omit<TPlayer, "id">[] = [
  { name: "Alex", emoji: "🎨", isHuman: false },
  { name: "Sam", emoji: "🚀", isHuman: false },
  { name: "Jordan", emoji: "🌟", isHuman: false },
  { name: "Emilien", emoji: "🤖", isHuman: false },
  { name: "Robin", emoji: "🔥", isHuman: false },
  { name: "Casey", emoji: "⚡", isHuman: false },
  { name: "Morgan", emoji: "🏆", isHuman: false },
];

function buildInitialRounds(human: TPlayer): Round[] {
  const bots: TPlayer[] = BOTS.map((b, i) => ({ ...b, id: i + 2 }));
  // Human always in match 0 as p1
  const qfPlayers = [human, bots[0], bots[1], bots[2], bots[3], bots[4], bots[5], bots[6]];
  const qfMatches: Match[] = [
    { id: "qf0", p1: qfPlayers[0], p2: qfPlayers[1], winner: null, p1Score: 0, p2Score: 0 },
    { id: "qf1", p1: qfPlayers[2], p2: qfPlayers[3], winner: null, p1Score: 0, p2Score: 0 },
    { id: "qf2", p1: qfPlayers[4], p2: qfPlayers[5], winner: null, p1Score: 0, p2Score: 0 },
    { id: "qf3", p1: qfPlayers[6], p2: qfPlayers[7], winner: null, p1Score: 0, p2Score: 0 },
  ];
  return [
    { name: "Quarts de finale", matches: qfMatches },
    { name: "Demi-finales", matches: [] },
    { name: "Finale", matches: [] },
  ];
}

function simulateMatch(p1: TPlayer, p2: TPlayer, matchId: string): Match {
  const p1Score = Math.floor(Math.random() * 8) + 2;
  const p2Score = Math.floor(Math.random() * 8) + 2;
  const winner = p1Score >= p2Score ? p1 : p2;
  return { id: matchId, p1, p2, winner, p1Score, p2Score };
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export default function TournamentGame({ onBack }: Props) {
  const human: TPlayer = { id: 1, name: "Vous", emoji: "😊", isHuman: true };

  const [rounds, setRounds] = useState<Round[]>(() => buildInitialRounds(human));
  const [roundIndex, setRoundIndex] = useState(0); // 0=QF, 1=SF, 2=Final
  const [phase, setPhase] = useState<Phase>("bracket");
  const [humanMatch, setHumanMatch] = useState<Match | null>(null);

  // In-match state
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [questionIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [matchOver, setMatchOver] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [simulatingStep, setSimulatingStep] = useState(0); // which other match is being revealed

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const oppTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find human's match in current round
  const currentRound = rounds[roundIndex];
  const humanMatchInRound = currentRound?.matches.find(
    (m) => m.p1.isHuman || m.p2.isHuman
  ) ?? null;
  const opponent = humanMatchInRound
    ? humanMatchInRound.p1.isHuman
      ? humanMatchInRound.p2
      : humanMatchInRound.p1
    : null;

  // ── Start a round ──────────────────────────────────────────────────────────

  const startRound = useCallback(async () => {
    setLoadingQ(true);
    setPhase("playing");
    setQIndex(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setPlayerScore(0);
    setOpponentScore(0);
    setTimeLeft(QUESTION_TIME);
    setOpponentAnswered(false);
    setMatchOver(false);
    const qs = await fetchQuestions();
    setQuestions(qs);
    setLoadingQ(false);
  }, []);

  // ── Timer ──────────────────────────────────────────────────────────────────

  const advanceQuestion = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (oppTimerRef.current) clearTimeout(oppTimerRef.current);

    setQIndex((prev) => {
      if (prev + 1 >= TOTAL_QUESTIONS) {
        setMatchOver(true);
        return prev;
      }
      return prev + 1;
    });
    setSelectedAnswer(null);
    setRevealed(false);
    setOpponentAnswered(false);
    setTimeLeft(QUESTION_TIME);
  }, []);

  const revealAnswer = useCallback(
    (chosen: number | null) => {
      if (revealed) return;
      setRevealed(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
      const isCorrect = chosen !== null && chosen === questions[questionIndex]?.correctIndex;
      if (isCorrect) setPlayerScore((s) => s + 1);
      setTimeout(advanceQuestion, 2000);
    },
    [revealed, questions, questionIndex, advanceQuestion]
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (revealed || selectedAnswer !== null) return;
      setSelectedAnswer(idx);
      revealAnswer(idx);
    },
    [revealed, selectedAnswer, revealAnswer]
  );

  // Timer effect
  useEffect(() => {
    if (phase !== "playing" || loadingQ || matchOver || revealed || questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); revealAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questionIndex, phase, loadingQ, matchOver, revealed, questions.length]);

  // Opponent simulate answer
  useEffect(() => {
    if (phase !== "playing" || loadingQ || matchOver || revealed || questions.length === 0) return;
    const delay = 4000 + Math.random() * 14000;
    oppTimerRef.current = setTimeout(() => {
      if (!revealed) {
        setOpponentAnswered(true);
        const correct = Math.random() < 0.55;
        if (correct) setOpponentScore((s) => s + 1);
        setTimeLeft((t) => Math.min(t, 5));
      }
    }, delay);
    return () => { if (oppTimerRef.current) clearTimeout(oppTimerRef.current); };
  }, [questionIndex, phase, loadingQ, matchOver, revealed, questions.length]);

  // Re-sync timer after opponent answered (clamp to 5)
  useEffect(() => {
    if (!opponentAnswered || revealed || phase !== "playing") return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); revealAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [opponentAnswered]);

  // ── Match over → resolve round ─────────────────────────────────────────────

  useEffect(() => {
    if (!matchOver) return;
    const humanWon = playerScore >= opponentScore;

    setRounds((prev) => {
      const next = prev.map((r, ri) => {
        if (ri !== roundIndex) return r;
        return {
          ...r,
          matches: r.matches.map((m) => {
            if (!m.p1.isHuman && !m.p2.isHuman) return m;
            const winner = humanWon
              ? (m.p1.isHuman ? m.p1 : m.p2)
              : (m.p1.isHuman ? m.p2 : m.p1);
            return { ...m, winner, p1Score: m.p1.isHuman ? playerScore : opponentScore, p2Score: m.p1.isHuman ? opponentScore : playerScore };
          }),
        };
      });
      return next;
    });

    setHumanMatch(humanMatchInRound
      ? {
          ...humanMatchInRound,
          winner: humanWon
            ? (humanMatchInRound.p1.isHuman ? humanMatchInRound.p1 : humanMatchInRound.p2)
            : (humanMatchInRound.p1.isHuman ? humanMatchInRound.p2 : humanMatchInRound.p1),
          p1Score: humanMatchInRound.p1.isHuman ? playerScore : opponentScore,
          p2Score: humanMatchInRound.p1.isHuman ? opponentScore : playerScore,
        }
      : null);

    // Simulate other matches sequentially then show results
    setPhase("simulating");
    setSimulatingStep(0);
  }, [matchOver]);

  // Sequential simulation of other matches
  useEffect(() => {
    if (phase !== "simulating") return;
    const otherMatches = currentRound.matches.filter((m) => !m.p1.isHuman && !m.p2.isHuman && m.winner === null);
    if (simulatingStep >= otherMatches.length) {
      // All simulated → build next round's matches
      setRounds((prev) => {
        const updated = [...prev];
        // Re-simulate remaining matches of this round
        const thisRound = { ...updated[roundIndex] };
        const newMatches = thisRound.matches.map((m) => {
          if (m.winner !== null) return m;
          return simulateMatch(m.p1, m.p2, m.id);
        });
        thisRound.matches = newMatches;
        updated[roundIndex] = thisRound;

        // Build next round from winners
        if (roundIndex + 1 < updated.length) {
          const winners = newMatches.map((m) => m.winner!);
          const nextMatches: Match[] = [];
          for (let i = 0; i < winners.length; i += 2) {
            nextMatches.push({
              id: `r${roundIndex + 1}m${i / 2}`,
              p1: winners[i],
              p2: winners[i + 1],
              winner: null,
              p1Score: 0,
              p2Score: 0,
            });
          }
          updated[roundIndex + 1] = { ...updated[roundIndex + 1], matches: nextMatches };
        }
        return updated;
      });
      setPhase("round-result");
      return;
    }

    const t = setTimeout(() => {
      const m = otherMatches[simulatingStep];
      setRounds((prev) => {
        const updated = [...prev];
        const thisRound = { ...updated[roundIndex] };
        thisRound.matches = thisRound.matches.map((match) =>
          match.id === m.id ? simulateMatch(m.p1, m.p2, m.id) : match
        );
        updated[roundIndex] = thisRound;
        return updated;
      });
      setSimulatingStep((s) => s + 1);
    }, 1200);
    return () => clearTimeout(t);
  }, [phase, simulatingStep, currentRound, roundIndex]);

  // ── round-result → advance ─────────────────────────────────────────────────

  const advanceToNextRound = useCallback(() => {
    const updatedRound = rounds[roundIndex];
    const humanWon = updatedRound.matches.some(
      (m) => m.winner?.isHuman
    );
    if (!humanWon) { setPhase("eliminated"); return; }
    if (roundIndex + 1 >= rounds.length) { setPhase("champion"); return; }
    setRoundIndex((r) => r + 1);
    setPhase("bracket");
  }, [rounds, roundIndex]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (phase === "eliminated") {
    return <EndScreen won={false} onBack={onBack} rounds={rounds} human={human} />;
  }
  if (phase === "champion") {
    return <EndScreen won={true} onBack={onBack} rounds={rounds} human={human} />;
  }

  if (phase === "bracket") {
    return (
      <BracketView
        rounds={rounds}
        currentRoundIndex={roundIndex}
        human={human}
        onStart={startRound}
        onBack={onBack}
      />
    );
  }

  if (phase === "playing" || phase === "simulating") {
    const q = questions[questionIndex];
    const timerPct = (timeLeft / QUESTION_TIME) * 100;
    const timerColor =
      timeLeft > 15
        ? "from-green-400 to-cyan-400"
        : timeLeft > 7
        ? "from-yellow-400 to-orange-400"
        : "from-red-400 to-pink-400";

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm flex items-center gap-2`}>
            <Trophy className="w-4 h-4" />
            {currentRound.name}
          </div>
          <div className="text-white/50 text-sm">{questionIndex + 1} / {TOTAL_QUESTIONS}</div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-8 px-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl">
              {human.emoji}
            </div>
            <div className="text-right">
              <div className="text-white/60 text-sm">{human.name}</div>
              <div className="text-white">{playerScore}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/30">
            <Swords className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-white/60 text-sm">{opponent?.name}</div>
              <div className="text-white">{opponentScore}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">
              {opponent?.emoji}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full">
          {loadingQ || !q ? (
            <div className="text-white animate-pulse">Chargement…</div>
          ) : matchOver ? (
            <div className="text-center text-white">
              <div className="text-4xl mb-4">{playerScore >= opponentScore ? "🎉" : "😔"}</div>
              <p>{playerScore >= opponentScore ? "Victoire !" : "Défaite"} — {playerScore} / {opponentScore}</p>
              <p className="text-white/50 text-sm mt-2">Simulation des autres matchs…</p>
            </div>
          ) : (
            <>
              {/* Timer */}
              <div className="w-full mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-2 text-sm ${timeLeft <= 7 ? "text-red-300 animate-pulse" : "text-white/70"}`}>
                    <Clock className="w-4 h-4" />
                    <span>{timeLeft}s</span>
                  </div>
                  {opponentAnswered ? (
                    <div className="flex items-center gap-2 text-amber-300 text-sm animate-pulse">
                      <CheckCircle className="w-4 h-4" />
                      <span>{opponent?.name} a répondu !</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                      <span>{opponent?.name} réfléchit…</span>
                    </div>
                  )}
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000`} style={{ width: `${timerPct}%` }} />
                </div>
              </div>

              {/* Category */}
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs">{q.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs ${q.difficulty === "easy" ? "bg-green-500/20 text-green-300" : q.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>
                  {q.difficulty}
                </span>
              </div>

              {/* Question */}
              <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
                <p className="text-white text-center leading-relaxed">{q.question}</p>
              </div>

              {/* Answers */}
              <div className="w-full grid gap-4 grid-cols-1 sm:grid-cols-2">
                {q.answers.map((answer, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === q.correctIndex;
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
                      className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${bg} ${!revealed ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{answer}</span>
                        {revealed && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />}
                        {revealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // round-result
  return (
    <RoundResultView
      rounds={rounds}
      roundIndex={roundIndex}
      human={human}
      onContinue={advanceToNextRound}
    />
  );
}

// ─── Bracket View ─────────────────────────────────────────────────────────────

function BracketView({
  rounds, currentRoundIndex, human, onStart, onBack,
}: {
  rounds: Round[];
  currentRoundIndex: number;
  human: TPlayer;
  onStart: () => void;
  onBack: () => void;
}) {
  const currentRound = rounds[currentRoundIndex];
  const myMatch = currentRound.matches.find((m) => m.p1.isHuman || m.p2.isHuman);
  const opponent = myMatch ? (myMatch.p1.isHuman ? myMatch.p2 : myMatch.p1) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quitter
          </button>
          <div className="flex items-center gap-2 text-white">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>Tournoi — {currentRound.name}</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Your match callout */}
        {opponent && (
          <div className="mb-8 p-6 rounded-2xl bg-white/10 border border-white/20 text-center">
            <p className="text-white/60 text-sm mb-3">Votre adversaire</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-3xl">{human.emoji}</div>
                <span className="text-white">{human.name}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Swords className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl">{opponent.emoji}</div>
                <span className="text-white">{opponent.name}</span>
              </div>
            </div>
            <button
              onClick={onStart}
              className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Lancer le match !
            </button>
          </div>
        )}

        {/* Full bracket */}
        <FullBracket rounds={rounds} human={human} />
      </div>
    </div>
  );
}

// ─── Round Result ─────────────────────────────────────────────────────────────

function RoundResultView({
  rounds, roundIndex, human, onContinue,
}: {
  rounds: Round[];
  roundIndex: number;
  human: TPlayer;
  onContinue: () => void;
}) {
  const round = rounds[roundIndex];
  const humanMatch = round.matches.find((m) => m.p1.isHuman || m.p2.isHuman);
  const humanWon = humanMatch?.winner?.isHuman ?? false;
  const isLast = roundIndex + 1 >= rounds.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="mb-6 text-center">
          {humanWon ? (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white mb-1">Vous avancez !</h2>
              <p className="text-white/60">{isLast ? "Vous êtes en finale !" : `Prochain tour : ${rounds[roundIndex + 1].name}`}</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Skull className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white mb-1">Éliminé</h2>
              <p className="text-white/60">Meilleure chance la prochaine fois…</p>
            </>
          )}
        </div>

        {/* Results for this round */}
        <div className="w-full max-w-lg mb-6 space-y-3">
          {round.matches.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <PlayerPill p={m.p1} won={m.winner?.id === m.p1.id} score={m.p1Score} />
              <span className="text-white/30 text-sm">vs</span>
              <PlayerPill p={m.p2} won={m.winner?.id === m.p2.id} score={m.p2Score} />
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          {humanWon ? <><Sparkles className="w-5 h-5" /> Continuer</> : <><ArrowLeft className="w-5 h-5" /> Voir les résultats</>}
        </button>
      </div>
    </div>
  );
}

function PlayerPill({ p, won, score }: { p: TPlayer; won: boolean; score: number }) {
  return (
    <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg ${won ? "bg-green-500/20 border border-green-400/30" : "bg-white/5 border border-white/10"}`}>
      <span>{p.emoji}</span>
      <span className={`text-sm flex-1 ${won ? "text-green-300" : "text-white/50"} ${p.isHuman ? "font-semibold" : ""}`}>{p.name}</span>
      <span className={`text-sm ${won ? "text-green-300" : "text-white/40"}`}>{score}</span>
      {won && <Crown className="w-3 h-3 text-yellow-400" />}
    </div>
  );
}

// ─── End Screen ───────────────────────────────────────────────────────────────

function EndScreen({ won, onBack, rounds, human }: { won: boolean; onBack: () => void; rounds: Round[]; human: TPlayer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ${won ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
            {won ? <Crown className="w-12 h-12 text-white" /> : <Skull className="w-12 h-12 text-white" />}
          </div>
          <h2 className="text-white mb-2">{won ? "Champion du tournoi ! 🏆" : "Éliminé du tournoi"}</h2>
          <p className="text-white/60">{won ? "Vous avez battu tous vos adversaires !" : "Vous vous êtes bien battu !"}</p>
        </div>

        <FullBracket rounds={rounds} human={human} />

        <button
          onClick={onBack}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au menu
        </button>
      </div>
    </div>
  );
}

// ─── Full Bracket Display ─────────────────────────────────────────────────────

function FullBracket({ rounds, human }: { rounds: Round[]; human: TPlayer }) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-0 min-w-max mx-auto justify-center">
        {rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col justify-around" style={{ minWidth: 180 }}>
            <div className="text-white/40 text-xs text-center mb-3 px-2">{round.name}</div>
            <div className="flex flex-col gap-4 justify-around flex-1">
              {round.matches.length === 0 ? (
                <div className="text-white/20 text-xs text-center italic">En attente…</div>
              ) : (
                round.matches.map((m) => (
                  <BracketMatchCard key={m.id} match={m} humanId={human.id} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatchCard({ match, humanId }: { match: Match; humanId: number }) {
  return (
    <div className="mx-2 rounded-xl border border-white/20 overflow-hidden">
      {[match.p1, match.p2].map((p) => {
        const isWinner = match.winner?.id === p.id;
        const isPending = match.winner === null;
        const isHuman = p.id === humanId;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-3 py-2 text-sm ${
              isWinner
                ? isHuman
                  ? "bg-blue-500/30 text-blue-200"
                  : "bg-green-500/20 text-green-300"
                : isPending
                ? "bg-white/5 text-white/70"
                : "bg-white/3 text-white/25"
            } ${isHuman ? "font-semibold" : ""}`}
          >
            <span>{p.emoji}</span>
            <span className="flex-1 truncate">{p.name}</span>
            {isWinner && <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}
