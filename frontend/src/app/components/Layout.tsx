import { Sparkles, MessageCircle, Send, X, Minus, LogOut } from "lucide-react";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

interface LayoutProps {
  username: string;
  onLogout: () => void;
}

export default function Layout({ username, onLogout }: LayoutProps) {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100">
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
              onClick={() => navigate("/profile")}
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-white font-medium">{username}</span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl ring-2 ring-white/50">
                😊
              </div>
            </button>

            {/* VRAI BOUTON DÉCONNEXION FIGMA STYLE */}
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </div>
      </nav>

      <div className="pt-20">
        <Outlet />
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
