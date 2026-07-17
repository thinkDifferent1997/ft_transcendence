import { Trophy, Target, TrendingUp, Star, Camera, Award, Zap, Shield, QrCode, X, CheckCircle, Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart";
import { socket } from "../../socket/socket";

interface ProfilePageProps {
  username: string;
  onBack?: () => void;
}

interface SummaryData {
  gamesPlayed: number;
  answers: { correct: number; incorrect: number; total: number; successRate: number };
  avgResponseTime: number;
  categories: { categoryName: string; correct: number; total: number; successRate: number }[];
  winLoss: { played: number; wins: number; losses: number; draws: number };
  tournamentsWon: number;
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

export default function ProfilePage({ username, onBack }: ProfilePageProps) {
  const [avatar, setAvatar] = useState("😊");
  const [stats, setStats] = useState<SummaryData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // États pour le 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error2FA, setError2FA] = useState("");

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/stats/me/summary?${params}`, { credentials: "include" });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Erreur lors du chargement des stats :", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchStats();
  }, []);

  // Temps réel : écoute les mises à jour de stats poussées par le serveur
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("stats:subscribe", { userId: username });

    const handleUpdate = (data: SummaryData) => {
      // On ne remplace que si aucun filtre de date n'est actif,
      // pour ne pas écraser une vue filtrée par l'utilisateur.
      if (!startDate && !endDate) {
        setStats(data);
      }
    };

    socket.on("stats:updated", handleUpdate);

    return () => {
      socket.off("stats:updated", handleUpdate);
    };
  }, [username, startDate, endDate]);

  const emojis = ["😊", "🎨", "🚀", "🌟", "🎯", "🔥", "💫", "🎮", "🏆", "⚡"];

  // Demander le QR Code au backend
  const handleSetup2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Erreur réseau : Le backend a refusé la requête.");
        return;
      }

      const data = await res.json();

      if (data && data.qrCodeDataUrl) {
        setQrCodeUrl(data.qrCodeDataUrl);
        setShow2FAModal(true);
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
        setIs2FAEnabled(true);
        setShow2FAModal(false);
        setVerificationCode("");
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
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Activer le 2FA</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Scannez ce QR Code avec Google Authenticator ou Authy.
              </p>
            </div>

            <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-lg shadow-sm" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400 animate-pulse">Chargement...</div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
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

              <button
                onClick={handleEnable2FA}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Confirmer l'activation
              </button>
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
            Retour
          </button>
        )}

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-6xl">
                  {avatar}
                </div>
              </div>
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
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-4xl font-extrabold m-0">
                  {username}
                </h1>
                {is2FAEnabled && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200 shadow-sm">
                    <CheckCircle className="w-4 h-4" /> 2FA Sécurisé
                  </span>
                )}
              </div>

              {!is2FAEnabled && (
                <button
                  onClick={handleSetup2FA}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  Sécuriser mon compte (Activer 2FA)
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-6 md:mt-0">
              <div className="px-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.gamesPlayed ?? 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Parties</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.answers.successRate ?? 0}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Précision</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-2xl font-bold">
                  {stats?.tournamentsWon ?? 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Victoires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres de date + Export */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Depuis</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jusqu'à</label>
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
            Filtrer
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
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Statistiques globales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.gamesPlayed ?? 0}</div>
                <div className="opacity-90 font-medium">Parties jouées</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.answers.successRate ?? 0}%</div>
                <div className="opacity-90 font-medium">Taux de réussite global</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{stats?.tournamentsWon ?? 0}</div>
                <div className="opacity-90 font-medium">Victoires en tournoi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Stats — barres de progression */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-8">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Target className="w-6 h-6 text-indigo-600" />
            Statistiques par thème
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
                <p className="text-sm text-gray-500 font-medium text-right m-0">{stat.total} question(s) répondue(s)</p>
              </div>
            ))}
            {(stats?.categories ?? []).length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-6">Aucune donnée pour l'instant — joue une partie !</p>
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
                Réponses par thème
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
                Résultats des parties
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
      </div>
    </div>
  );
}