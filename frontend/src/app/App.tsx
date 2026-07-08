import {
  Brain,
  Users,
  Bot,
  Trophy,
  Sparkles,
  MessageCircle,
  Send,
  X,
  Minus,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import TournamentLobby from "./components/TournamentLobby";
import GamePage from "./components/GamePage";
import TournamentGame from "./components/TournamentGame";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Joueur");
  const [currentPage, setCurrentPage] = useState<"home" | "profile" | "tournament" | "game">("home");
  const [gameMode, setGameMode] = useState<"solo" | "ai" | "party" | "tournament">("solo");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Alex",
      avatar: "🎨",
      text: "Anyone up for a tournament?",
      time: "2m ago",
    },
    {
      id: 2,
      user: "Sam",
      avatar: "🚀",
      text: "Just beat the AI in hard mode!",
      time: "5m ago",
    },
    {
      id: 3,
      user: "Jordan",
      avatar: "🌟",
      text: "Looking for party mode players!",
      time: "8m ago",
    },
  ]);
  const gameModes = [
    {
      id: "solo",
      title: "Solo",
      description: "Test tes connaissances dans un mode solo",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:from-blue-600 hover:to-cyan-600",
    },
    {
      id: "ai",
      title: "1v1 AI",
      description: "Challenge notre IA Emilien !",
      icon: Bot,
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:from-purple-600 hover:to-pink-600",
    },
    {
      id: "party",
      title: "1v1 Party",
      description: "Defi tes amis dans un duel en temps reel",
      icon: Users,
      color: "from-orange-500 to-red-500",
      hoverColor: "hover:from-orange-600 hover:to-red-600",
    },
    {
      id: "tournament",
      title: "Tournoi",
      description:
        "Rejoins un tournoi pour te hisser a la premiere place !",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      hoverColor: "hover:from-yellow-600 hover:to-amber-600",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          user: "You",
          avatar: "😊",
          text: message,
          time: "Just now",
        },
      ]);
      setMessage("");
    }
  };

  useEffect(() => {
    const isQuizRoute = window.location.pathname === "/quiz";

    // Si on arrive sur /quiz, on demande au backend de lire le cookie 42
    if (isQuizRoute) {
      fetch("https://localhost:8443/api/auth/me", {
        credentials: 'include',
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Session invalide");
        })
        .then((data) => {
          if (data && data.username) {
            setUsername(data.username);
            setIsLoggedIn(true);

            // On nettoie l'URL
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      // On prévient le backend pour qu'il détruise le cookie
      await fetch("https://localhost:8443/api/auth/logout", {
        method: "POST",
        credentials: 'include', // Important pour que le backend sache quel cookie supprimer
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion backend :", err);
    } finally {
      // Quoi qu'il arrive (même si le réseau flanche), on déconnecte le front
      setIsLoggedIn(false);
      setCurrentPage("home");
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
	  return (
		  <LoginPage
		  force2FA={window.location.pathname === "/2fa"}
		  onLogin={(name?: string) => {
			  if (name) setUsername(name);
			  setIsLoggedIn(true);
			  if (window.location.pathname === "/2fa") {
				  window.history.replaceState({}, document.title, "/");
			  }
		  }}
		  />
	  );
  }

  // Show profile page
  if (currentPage === "profile") {
	return <ProfilePage username={username} onBack={() => setCurrentPage("home")} />; 
  }

  // Show tournament lobby
  if (currentPage === "tournament") {
    return (
      <TournamentLobby
	  	username={username}
        onBack={() => setCurrentPage("home")}
        onStartGame={() => {
          setGameMode("tournament");
          setCurrentPage("game");
        }}
      />
    );
  }

  // Show game page
  if (currentPage === "game") {
    if (gameMode === "tournament") {
		return <TournamentGame onBack={() => setCurrentPage("home")} />;
    }
    return <GamePage mode={gameMode} onBack={() => setCurrentPage("home")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100">
      {/* Top Navigation Bar */}

	  {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Bloc de Gauche : Logo et Titre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Culture Quiz
            </span>
          </div>

          {/* Bloc de Droite : Profil et Déconnexion */}
          <div className="flex items-center gap-4">

            {/* Bouton Profil */}
            <button
              onClick={() => setCurrentPage("profile")}
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-white font-medium">{username}</span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl ring-2 ring-white/50">
                😊
              </div>
            </button>

            {/* VRAI BOUTON DÉCONNEXION FIGMA STYLE */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8 pt-24">
        {/* Header */}
        <div className="text-center mb-16 pt-12">
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
                    setCurrentPage("tournament");
                  } else {
                    setGameMode(mode.id as "solo" | "ai" | "party");
                    setCurrentPage("game");
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

        {/* Stats or Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-2"></div>
            <div className="opacity-90">X joueurs en ligne</div>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-2"></div>
            <div className="opacity-90">
              XX% de bonne reponse
            </div>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="opacity-90">
              Aucun tournoi en cours
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl w-96 h-[32rem] flex flex-col overflow-hidden border-2 border-purple-200">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white">Chat</span>
                <span className="bg-white/30 text-white px-2 py-0.5 rounded-full text-sm">
                  245 online
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-3 animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 text-lg">
                    {msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-900">
                        {msg.user}
                      </span>
                      <span className="text-xs text-gray-400">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xl hover:shadow-purple-400/50 transition-all hover:scale-110 relative"
          >
            <MessageCircle className="w-7 h-7" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs animate-pulse">
              3
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
