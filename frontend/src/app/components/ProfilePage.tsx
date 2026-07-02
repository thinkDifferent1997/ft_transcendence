import { Trophy, Target, TrendingUp, Star, Camera, Award, Zap } from "lucide-react";
import { useState } from "react";

interface ProfilePageProps {
	username: string;
	onBack?: () => void;
}

export default function ProfilePage({ username, onBack }: ProfilePageProps) {
  const [avatar, setAvatar] = useState("😊");

  // Mock user data
  const userData = {
    name: username,
    level: 15,
    totalGames: 127,
    globalAccuracy: 78,
    tournamentWins: 5,
    rank: "#342",
  };

  const themeStats = [
    { theme: "Histoire", accuracy: 85, games: 45, color: "from-blue-500 to-cyan-500" },
    { theme: "Sciences", accuracy: 72, games: 32, color: "from-purple-500 to-pink-500" },
    { theme: "Arts", accuracy: 81, games: 28, color: "from-orange-500 to-red-500" },
    { theme: "Géographie", accuracy: 76, games: 22, color: "from-green-500 to-emerald-500" },
  ];

  const achievements = [
    { name: "Première victoire", icon: Trophy, earned: true },
    { name: "100 parties", icon: Star, earned: true },
    { name: "Perfectionniste", icon: Target, earned: false },
    { name: "Champion", icon: Award, earned: true },
  ];

  const emojis = ["😊", "🎨", "🚀", "🌟", "🎯", "🔥", "💫", "🎮", "🏆", "⚡"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
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
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-6xl">
                  {avatar}
                </div>
              </div>
              {/* Avatar Change Button */}
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                  {/* Avatar picker dropdown */}
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

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {userData.name}
              </h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                  Niveau {userData.level}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                  Rang {userData.rank}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="px-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {userData.totalGames}
                </div>
                <div className="text-sm text-gray-600">Parties</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {userData.globalAccuracy}%
                </div>
                <div className="text-sm text-gray-600">Précision</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {userData.tournamentWins}
                </div>
                <div className="text-sm text-gray-600">Victoires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          {/* Global Stats */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
            <h3 className="mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Statistiques globales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <div className="mb-2">{userData.totalGames}</div>
                <div className="opacity-90">Parties jouées</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <div className="mb-2">{userData.globalAccuracy}%</div>
                <div className="opacity-90">Taux de réussite global</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <div className="mb-2">{userData.tournamentWins}</div>
                <div className="opacity-90">Victoires en tournoi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Stats */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
          <h3 className="mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Statistiques par thème
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themeStats.map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4>{stat.theme}</h4>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-gradient-to-r ${stat.color} h-3 rounded-full transition-all shadow-md`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{stat.games} parties jouées</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
