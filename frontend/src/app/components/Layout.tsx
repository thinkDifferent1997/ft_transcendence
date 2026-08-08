import { Sparkles, MessageCircle, Send, X, Minus, LogOut, Trophy } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { socket } from "../../socket/socket";
import { useGame } from "../context/GameContext";

interface LayoutProps {
	username: string;
	onLogout: () => void;
}

export default function Layout({ username, onLogout }: LayoutProps) {
const navigate = useNavigate();

const [userAvatar, setUserAvatar] = useState<string | null>(null);

// --- LOGIQUE DU CHAT ---
const [isChatOpen, setIsChatOpen] = useState(false);
const [messages, setMessages] = useState<any[]>([]);
const [newMessage, setNewMessage] = useState("");
const messagesEndRef = useRef<HTMLDivElement>(null);
const { isInGame } = useGame();

const MAX_MESSAGE_LENGTH = 500;
const [chatError, setChatError] = useState<string | null>(null);

const handleSendMessage = () => {
    const content = newMessage.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return;
    socket.emit("send_message", { content });
    setNewMessage("");
    setChatError(null);
};

const handleNavigate = (path: string) =>
  {
      if (isInGame)
          {
              const leave = window.confirm(
                  "Leaving the game will count as a defeat. Continue?"
              );

              if (!leave)
                  return;
      setTimeout(() => {
        navigate(path);
      }, 100);
			socket.emit("leave_game");
			return;
		}
		navigate(path);
	};

    useEffect(() => {
        fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
            if (data?.avatar) setUserAvatar(data.avatar);
        })
        .catch((err) => console.error("Erreur profil:", err));

        fetch("/api/chat/history")
        .then((res) => res.json())
        .then((data) => {
            if (Array.isArray(data)) setMessages(data);
            else setMessages([]);
        })
        .catch((err) => {
        console.error("Erreur historique:", err);
        setMessages([]);
      });
}, []);

    useEffect(() => {
        socket.connect();
        socket.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg].slice(-200));
	});
    socket.on("message_error", (err) => {
        setChatError(err?.message ?? "Message could not be sent");
    });
	return () => {
		socket.off("receive_message");
        socket.off("message_error");
    };
}, []);

	useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);


return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100">
      
      {/* --- 1. BARRE DE NAVIGATION (NAVBAR) --- */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Bloc de Gauche : Logo et Titre */}
          <button
            onClick={() => handleNavigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Culture Quiz
            </span>
          </button>
 
          {/* Bloc de Droite : Leaderboard, Profil et Déconnexion */}
          <div className="flex items-center gap-4">
            
            {/* Bouton Classement */}
            <button
              onClick={() => handleNavigate("/leaderboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white text-gray-700 hover:text-amber-600 border border-gray-200 transition-all shadow-sm hover:shadow-md"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Classement</span>
            </button>

            {/* Bouton Profil (avec avatar dynamique) */}
            <button
              onClick={() => handleNavigate("/profile")}
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-white font-medium">{username}</span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl ring-2 ring-white/50 overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span>😊</span>
                )}
              </div>
            </button>

            {/* Bouton Déconnexion */}
            <button
              onClick={() => {
                if (isInGame) {
                  const leave = window.confirm("Leaving the game will count as a defeat. Continue?");
                  if (!leave) return;
                  socket.emit("leave_game");
                }
                onLogout();
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </nav>

      {/* --- 2. CONTENU PRINCIPAL DE LA PAGE --- */}
      <div className="pt-20">
        <Outlet />
      </div>

      {/* --- 3. WIDGET CHAT --- */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl w-96 h-[32rem] flex flex-col overflow-hidden border-2 border-purple-200">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-white font-bold">Chat Global</span>
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

            {/* Messages (Zone de texte) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {Array.isArray(messages) && messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-4">Aucun message pour l'instant...</p>
              ) : (
                Array.isArray(messages) && messages.map((msg, index) => {
                  const authorName = msg.author?.username || msg.user || "Inconnu";
                  
                  return (
                    <div
                      key={msg.id || index}
                      className="flex gap-3 animate-in fade-in slide-in-from-bottom-2"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 text-lg">
                        {msg.avatar || "😊"}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          {/* Pseudo Cliquable */}
                          <span
                            onClick={() => {
                                if (authorName !== "Inconnu") {
                                    navigate(`/profile/${authorName}`);
                                }
                            }}
                            className="text-sm font-bold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          >
                            {authorName}
                          </span>
                          {/* Heure */}
                          {msg.time && (
                            <span className="text-xs text-gray-400">
                              {msg.time}
                            </span>
                          )}
                        </div>
                        
                        {/* Bulle du message */}
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mt-1 w-fit max-w-[95%] text-sm text-gray-800 break-words">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Le ref pour l'auto-scroll en bas du chat */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input (Taper un message) */}
            <div className="p-3 bg-white border-t border-gray-100">
            { chatError && (
                <p className="text-xs text-red-500 mb-2 px-2">{chatError}</p>
            )}
            <div className="flex gap-2 items-center">
            <input
            type="text"
            placeholder="Écrire un message..."
            value={newMessage}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-purple-300"
            />
            { newMessage.length > MAX_MESSAGE_LENGTH - 100 && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                { newMessage.length}/{MAX_MESSAGE_LENGTH}
                </span>
            )}
            <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
            <Send className="w-4 h-4" />
            </button>
            </div>
            </div>
            </div>
        ) : (
          
          /* Bouton pour ouvrir le chat (quand il est fermé) */
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

        )}
      </div>
    </div>
  );
}
