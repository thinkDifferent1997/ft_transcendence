import { useEffect, useState } from "react";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  gamesPlayed: number;
  wins: number;
}

interface LeaderboardPageProps {
  userId: string;
  onBack: () => void;
}

const RANK_STYLES: Record<number, string> = {
  1: "from-yellow-400 to-amber-500",
  2: "from-gray-300 to-gray-400",
  3: "from-amber-600 to-orange-700",
};

export default function LeaderboardPage({ userId, onBack }: LeaderboardPageProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [leaderboardRes, rankRes] = await Promise.all([
          fetch(`/api/stats/leaderboard?limit=20`, { credentials: "include" }),
          fetch(`/api/stats/${userId}/rank`, { credentials: "include" }),
        ]);

        if (leaderboardRes.ok) {
          setEntries(await leaderboardRes.json());
        }
        if (rankRes.ok) {
          const data = await rankRes.json();
          setMyRank(data.rank);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du classement :", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const isMe = (entry: LeaderboardEntry) => entry.userId === userId;
  const isImageUrl = (avatar: string | null): boolean =>
  !!avatar && /^(https?:\/\/|\/)/.test(avatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          {myRank !== null && (
            <div className="px-4 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
              Ton rang : <span className="font-black text-indigo-600">#{myRank}</span>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ranking
          </h1>
          <p className="text-gray-500 mt-1">Best players, ranked by XP</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-center py-12">Chargement...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-400 text-center py-12">Aucun joueur classé pour l'instant.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isMe(entry) ? "bg-indigo-50" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white flex-shrink-0 ${
                      entry.rank <= 3
                        ? `bg-gradient-to-br ${RANK_STYLES[entry.rank]} shadow-md`
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {entry.rank <= 3 ? (
                      entry.rank === 1 ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <Medal className="w-5 h-5" />
                      )
                    ) : (
                      entry.rank
                    )}
                  </div>

<div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl ring-2 ring-white/50 shadow flex-shrink-0 overflow-hidden">
  {isImageUrl(entry.avatar) ? (
    <img
      src={entry.avatar!}
      alt={entry.username}
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  ) : (
    entry.avatar || "😊"
  )}
</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 m-0 truncate">
                      {entry.username}
                      {isMe(entry) && <span className="text-indigo-500 font-medium"> (toi)</span>}
                    </p>
                    <p className="text-xs text-gray-500 m-0 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Niveau {entry.level} · {entry.gamesPlayed} partie(s) · {entry.wins} victoire(s)
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lg bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent m-0">
                      {entry.xp}
                    </p>
                    <p className="text-xs text-gray-400 m-0">XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
