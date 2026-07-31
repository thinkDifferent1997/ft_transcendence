import { Brain, Users, Bot, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const gameModes = [
  // {
  //   id: "solo",
  //   title: "Solo",
  //   description: "Test tes connaissances dans un mode solo",
  //   icon: Brain,
  //   color: "from-blue-500 to-cyan-500",
  //   hoverColor: "hover:from-blue-600 hover:to-cyan-600",
  // },
  {
    id: "ai",
    title: "1v1 AI",
    description: "Challenge our AI TriviaBot!",
    icon: Bot,
    color: "from-purple-500 to-pink-500",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
  },
  {
    id: "party",
    title: "1v1 Party",
    description: "Duel your friends in a 1v1 party game !",
    icon: Users,
    color: "from-orange-500 to-red-500",
    hoverColor: "hover:from-orange-600 hover:to-red-600",
  },
  {
    id: "tournament",
    title: "Tournoi",
    description:
      "Compete in a 4-player tournament and become the champion !",
    icon: Trophy,
    color: "from-yellow-500 to-amber-500",
    hoverColor: "hover:from-yellow-600 hover:to-amber-600",
  },
] as const;

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-16 pt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 shadow-xl animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Culture Quiz
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Choisis ton mode de jeu et devient un roi de la
          culture !
        </p>
      </div>

      {/* Game Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {gameModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => {
                if (mode.id === "tournament") {
                  navigate("/tournament");
                } else {
                  navigate(`/game/${mode.id}`);
                }
              }}
              className={`group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-current`}
              style={{
                borderImage: `linear-gradient(135deg, ${mode.id === "solo" ? "#3b82f6, #06b6d4" : mode.id === "ai" ? "#a855f7, #ec4899" : mode.id === "party" ? "#f97316, #ef4444" : "#eab308, #f59e0b"}) 1`,
              }}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <div className="relative">
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} mb-4 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2">{mode.title}</h3>
                <p className="text-muted-foreground">
                  {mode.description}
                </p>

                {/* Arrow indicator */}
                <div
                  className={`mt-4 flex items-center bg-gradient-to-r ${mode.color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <span className="mr-2">Start playing</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
