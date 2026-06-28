import { Trophy, Users, Clock, ArrowLeft, Crown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface TournamentLobbyProps {
  onBack?: () => void;
  onStartGame?: () => void;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  level: number;
  isReady: boolean;
}

export default function TournamentLobby({ onBack, onStartGame }: TournamentLobbyProps) {
  const maxPlayers = 8;
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "Manewa", avatar: "😊", level: 15, isReady: true },
    { id: 2, name: "Alex", avatar: "🎨", level: 12, isReady: true },
    { id: 3, name: "Sam", avatar: "🚀", level: 18, isReady: false },
  ]);

  const [countdown, setCountdown] = useState<number | null>(null);

  // Simulate players joining
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) => {
        if (prev.length < maxPlayers && Math.random() > 0.7) {
          const newPlayer: Player = {
            id: prev.length + 1,
            name: `Joueur${prev.length + 1}`,
            avatar: ["🌟", "🎯", "🔥", "💫", "⚡", "🏆"][Math.floor(Math.random() * 6)],
            level: Math.floor(Math.random() * 20) + 1,
            isReady: Math.random() > 0.5,
          };
          return [...prev, newPlayer];
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Start countdown when lobby is full
  useEffect(() => {
    if (players.length === maxPlayers && countdown === null) {
      setCountdown(5);
    }
  }, [players.length, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onStartGame?.();
    }
  }, [countdown]);

  const emptySlots = maxPlayers - players.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Quitter le lobby
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 mb-4 shadow-xl animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Lobby Tournoi
          </h1>
          <p className="text-gray-700">En attente de joueurs...</p>
        </div>

        {/* Player Counter */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/50">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {players.length}/{maxPlayers}
              </div>
              <p className="text-sm text-gray-600">Joueurs</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${(players.length / maxPlayers) * 100}%` }}
            />
          </div>

          {/* Countdown */}
          {countdown !== null && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse">
                <Clock className="w-5 h-5" />
                <span>Le tournoi commence dans {countdown}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 mb-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Joueurs dans le lobby
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all"
              >
                {/* Position Badge */}
                {index === 0 && (
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl">
                      {player.avatar}
                    </div>
                  </div>
                  {/* Ready indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      player.isReady ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h4 className="mb-1">{player.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      Niv. {player.level}
                    </span>
                    <span className={`text-xs ${player.isReady ? "text-green-600" : "text-gray-500"}`}>
                      {player.isReady ? "Prêt" : "En attente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">En attente...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                3
              </div>
              <p className="text-sm text-gray-600">Rounds</p>
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                10
              </div>
              <p className="text-sm text-gray-600">Questions/round</p>
            </div>
            <div>
              <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                30s
              </div>
              <p className="text-sm text-gray-600">Par question</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
