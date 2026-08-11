import { Trophy, Target, TrendingUp, Star, Camera, Award, Zap, Shield, QrCode, X, CheckCircle, Download, FileText, Lock, History, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { socket } from "../../socket/socket";
import { statsSocket } from "../../socket/socket";
import { useParams } from "react-router-dom";
import Avatar from "./Avatar";

interface ProfilePageProps {
  username: string;
  userId: string;
  /** État 2FA du compte connecté, lu depuis /api/auth/me. */
  isTwoFactorEnabled?: boolean;
  /** Relit la session après activation/désactivation du 2FA. */
  onTwoFactorChange?: () => void | Promise<void>;
  onBack?: () => void;
}

interface BadgeStat {
  code: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}

interface SummaryData {
  gamesPlayed: number;
  answers: { correct: number; incorrect: number; total: number; successRate: number };
  avgResponseTime: number;
  categories: { categoryName: string; correct: number; total: number; successRate: number }[];
  winLoss: { played: number; wins: number; losses: number; draws: number };
  tournamentsWon: number;
  xp: number;
  badges: BadgeStat[];
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
}

interface MatchHistoryEntry {
  roomId: string;
  date: string;
  opponent: string;
  score: number;
  opponentScore: number;
  result: "win" | "loss" | "draw";
}

const themeColors = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
];

const chartConfig: ChartConfig = {
  correct: { label: "Correctes", color: "#22c55e" },
  total: { label: "Total", color: "#e5e7eb" },
};

const winLossColors = ["#22c55e", "#ef4444", "#94a3b8"];

export default function ProfilePage({
  username,
  userId,
  isTwoFactorEnabled = false,
  onTwoFactorChange,
  onBack,
}: ProfilePageProps) {
  const [avatar, setAvatar] = useState("😊");
  const [stats, setStats] = useState<SummaryData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { targetUsername } = useParams();
  const displayUsername = targetUsername || username;
  const isMyProfile = displayUsername === username;
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // États pour le 2FA. L'activation elle-même n'est pas un état local :
  // elle vient du serveur (prop isTwoFactorEnabled), sinon un simple
  // rechargement de page la « perdrait » et on reproposerait un
  // enrôlement à quelqu'un qui en a déjà un.
  const [twoFAModal, setTwoFAModal] = useState<null | "enable" | "disable">(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error2FA, setError2FA] = useState("");

  const close2FAModal = () => {
    setTwoFAModal(null);
    setVerificationCode("");
    setError2FA("");
  };

 
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const endpoint = isMyProfile ? "me" : displayUsername;
      const res = await fetch(`/api/stats/${endpoint}/summary?${params}`, { credentials: "include" });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Erreur lors du chargement des stats :", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMatchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/stats/${userId}/history?limit=10`, { credentials: "include" });
      if (res.ok) {
        setMatchHistory(await res.json());
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique :", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchStats();
    fetchMatchHistory();
	if (isMyProfile) {
		fetch(`/api/auth/me`, { credentials: "include" })
		.then((res) => (res.ok ? res.json() : null))
		.then((data) => { if (data?.avatar) setAvatar(data.avatar); })
		.catch(() => {});
	}
  }, [displayUsername]);

  // Temps réel : écoute les mises à jour de stats poussées par le serveur
  useEffect(() => {
    if (!statsSocket.connected) {
      statsSocket.connect();
    }

    if (!displayUsername) return;
    statsSocket.emit("stats:subscribe", { userId: displayUsername });

    const handleUpdate = (data: SummaryData) => {
      // On ne remplace que si aucun filtre de date n'est actif,
      // pour ne pas écraser une vue filtrée par l'utilisateur.
      if (!startDate && !endDate) {
        setStats(data);
        fetchMatchHistory();
      }
    };

    statsSocket.on("stats:updated", handleUpdate);

    return () => {
      statsSocket.off("stats:updated", handleUpdate);
    };
  }, [displayUsername, startDate, endDate]);

  const emojis = ["😊", "🎨", "🚀", "🌟", "🎯", "🔥", "💫", "🎮", "🏆", "⚡"];

  // Demander le QR Code au backend
  const handleSetup2FA = async () => {
    setError2FA("");
    setQrCodeUrl("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Erreur réseau : Le backend a refusé la requête.");
        // Le serveur refuse un second enrôlement si le 2FA est déjà actif
        // (409) : on resynchronise pour refléter son état réel.
        await onTwoFactorChange?.();
        return;
      }

      const data = await res.json();

      if (data && data.qrCodeDataUrl) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setTwoFAModal("enable");
      } else {
        alert("Erreur : Le QR Code n'a pas été reçu.");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de joindre le serveur.");
    }
  };

  // Valider le code du téléphone
  const handleEnable2FA = async () => {
    setError2FA("");
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: verificationCode }),
      });

      if (res.ok) {
        close2FAModal();
        await onTwoFactorChange?.();
      } else {
        const data = await res.json();
        setError2FA(data.message || "Code invalide.");
      }
    } catch (err) {
      setError2FA("Erreur de connexion.");
    }
  };

  // Désactiver le 2FA : le serveur exige un code valide, une session
  // ouverte ne suffit pas à retirer le second facteur.
  const handleDisable2FA = async () => {
    setError2FA("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: verificationCode }),
      });

      if (res.ok) {
        close2FAModal();
        await onTwoFactorChange?.();
      } else {
        const data = await res.json();
        setError2FA(data.message || "Code invalide.");
      }
    } catch (err) {
      setError2FA("Erreur de connexion.");
    }
  };

  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-8 flex items-center justify-center">
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  const winLossData = stats
    ? [
        { name: "Victoires", value: stats.winLoss.wins },
        { name: "Défaites", value: stats.winLoss.losses },
        { name: "Nuls", value: stats.winLoss.draws },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-8 relative">

      {/* MODAL 2FA */}
      {twoFAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
            <button
              onClick={close2FAModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${
                  twoFAModal === "enable"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {twoFAModal === "enable" ? <QrCode className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {twoFAModal === "enable" ? "Activate the 2FA" : "Deactivate the 2FA"}
              </h3>
              <p className="text-gray-500 mt-2 text-sm">
                {twoFAModal === "enable"
                  ? "Scan the QR Code with Google Authenticator"
                  : "Write the code from your app to confirm"}
              </p>
            </div>

            {twoFAModal === "enable" && (
              <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-lg shadow-sm" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400 animate-pulse">Loading...</div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Ex: 123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-center tracking-widest text-lg font-bold outline-none transition-all"
                />
              </div>

              {error2FA && <p className="text-red-500 text-sm text-center font-medium">{error2FA}</p>}

              {twoFAModal === "enable" ? (
                <button
                  onClick={handleEnable2FA}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Confirm activation
                </button>
              ) : (
                <button
                  onClick={handleDisable2FA}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Confirm deactivation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
				<div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
				  <Avatar src={avatar} alt={displayUsername} className="w-full h-full text-6xl" />
                </div>
              </div>
              {isMyProfile && (
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-2 border border-purple-200">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className="w-10 h-10 rounded-lg hover:bg-purple-100 transition-all text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>)}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-4xl font-extrabold m-0">
                  {displayUsername}
                </h1>
              </div>

              {isMyProfile && !isTwoFactorEnabled && (
                <button
                  onClick={handleSetup2FA}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  Secure my account (2FA)
                </button>
              )}

              {isMyProfile && isTwoFactorEnabled && (
                <div className="inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-xl">
                    <Shield className="w-4 h-4" />
                    2FA activé
                  </span>
                  <button
                    onClick={() => {
                      setError2FA("");
                      setVerificationCode("");
                      setTwoFAModal("disable");
                    }}
                    className="text-sm font-semibold text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors"
                  >
                    Désactiver
                  </button>
                </div>
              )}

              {/* Progression du niveau */}
              <div className="mt-4 max-w-xs mx-auto md:mx-0">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1">
                  <span>Level {stats?.level ?? 1}</span>
                  <span>{stats?.currentLevelXp ?? 0} / 100 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${stats?.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mt-6 md:mt-0">
              <div className="px-4">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.level ?? 1}
                </div>
                <div className="text-sm text-gray-600 font-medium">Level</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.gamesPlayed ?? 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Games</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.answers.successRate ?? 0}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Accuracy</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.winLoss.wins ?? 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Victory</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.xp ?? 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres de date + Export */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white/50"
            />
          </div>
          <button
            onClick={fetchStats}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all"
          >
            Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                fetchStats();
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
            >
              Réinitialiser
            </button>
          )}
          {isMyProfile && (
          <div className="flex gap-2 ml-auto">
             <a href="/api/export/me/csv"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
            >
              <FileText className="w-4 h-4" />
              Export CSV
            </a>
            
             <a href="/api/export/me/pdf"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </a>
          </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Global Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.gamesPlayed ?? 0}</div>
                <div className="opacity-90 font-medium">Games played</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.answers.successRate ?? 0}%</div>
                <div className="opacity-90 font-medium">Correct answer rate</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.tournamentsWon ?? 0}</div>
                <div className="opacity-90 font-medium">Tournament win</div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Stats — barres de progression */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-8">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Target className="w-6 h-6 text-indigo-600" />
            Stats by category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(stats?.categories ?? []).map((stat, index) => (
              <div key={stat.categoryName} className="space-y-3 bg-white/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 m-0">{stat.categoryName}</h4>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className={`bg-gradient-to-r ${themeColors[index % themeColors.length]} bg-clip-text text-transparent font-black`}>
                      {stat.successRate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${themeColors[index % themeColors.length]} h-3 rounded-full transition-all shadow-md`}
                    style={{ width: `${stat.successRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium text-right m-0">{stat.total} answered</p>
              </div>
            ))}
            {(stats?.categories ?? []).length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-6">No data for now, run a game !</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-8">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Award className="w-6 h-6 text-pink-600" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(stats?.badges ?? []).map((badge) => (
              <div
                key={badge.code}
                title={badge.description}
                className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all ${
                  badge.earned
                    ? "bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border-amber-300 shadow-md"
                    : "bg-gray-100 border-gray-200 opacity-60"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    badge.earned
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg"
                      : "bg-gray-300"
                  }`}
                >
                  {badge.earned ? (
                    <Trophy className="w-7 h-7 text-white" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span className="font-bold text-sm text-gray-800">{badge.name}</span>
                <span className="text-xs text-gray-500">{badge.description}</span>
              </div>
            ))}
            {(stats?.badges ?? []).length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-6">
                Aucun badge pour l'instant — joue une partie !
              </p>
            )}
          </div>
        </div>

        {/* Graphiques interactifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bar chart : réponses par thème */}
          {(stats?.categories ?? []).length > 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
                <Award className="w-6 h-6 text-pink-600" />
                Answers by category
              </h3>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={stats!.categories}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="categoryName" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="correct" fill="var(--color-correct)" radius={4} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Pie chart : victoires / défaites / nuls */}
          {stats && stats.winLoss.played > 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
                <Trophy className="w-6 h-6 text-amber-600" />
                Match results
              </h3>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie data={winLossData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                    {winLossData.map((_, index) => (
                      <Cell key={index} fill={winLossColors[index]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          )}
        </div>

        {/* Historique des parties */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mt-8">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
            <History className="w-6 h-6 text-blue-600" />
            Game History
          </h3>

          {historyLoading ? (
            <p className="text-gray-400 text-center py-6">Loading...</p>
          ) : matchHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No 1v1 game yet, launch a game! !
            </p>
          ) : (
            <div className="space-y-2">
              {matchHistory.map((match) => (
                <div
                  key={match.roomId}
                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border ${
                    match.result === "win"
                      ? "bg-green-50 border-green-200"
                      : match.result === "loss"
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        match.result === "win"
                          ? "bg-green-500"
                          : match.result === "loss"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {match.result === "win" ? (
                        <Trophy className="w-4 h-4 text-white" />
                      ) : match.result === "loss" ? (
                        <X className="w-4 h-4 text-white" />
                      ) : (
                        <Minus className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 m-0">
                        vs {match.opponent}
                      </p>
                      <p className="text-xs text-gray-500 m-0">
                        {new Date(match.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-800 m-0">
                      {match.score} - {match.opponentScore}
                    </p>
                    <p
                      className={`text-xs font-bold m-0 ${
                        match.result === "win"
                          ? "text-green-600"
                          : match.result === "loss"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {match.result === "win"
                        ? "Victory"
                        : match.result === "loss"
                        ? "Defeat"
                        : "Draw"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
