import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import TournamentLobby from "./components/TournamentLobby";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GameRoute from "./routes/GameRoute";
import RequireAuth from "./routes/RequireAuth";
import QuizCallback from "./routes/QuizCallback";
import useAuthSession from "./hooks/useAuthSession";

import { useState, useEffect, useRef } from "react";
import { socket } from "../socket/socket";
import { MessageCircle, X, Send } from "lucide-react";

export default function App() {
  const { authChecked, isLoggedIn, username, setUsername, setIsLoggedIn } = useAuthSession();
  const navigate = useNavigate();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /////CHAT/////
  
  useEffect(() => {
      fetch("/api/chat/history")
      .then((res) => res.json())
      .then((data) => {
          if (Array.isArray(data)) {
              setMessages(data);
          } else {
                setMessages([]);
            }
        })
        .catch((err) => {
            console.error("Erreur historique:", err);
            setMessages([]);
        });
    }, []);

    useEffect(() => {
        socket.on("chat_message", (msg) => {
            console.log("📥 Message reçu du serveur :", msg); // 👈 Ajoute ceci
            setMessages((prev) => [...prev, msg]);
        });
        return () => {
            socket.off("chat_message");
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;
        console.log("📤 Envoi du message :", newMessage); // 👈 Ajoute ceci
        socket.emit("chat_message", { content: newMessage});
        setNewMessage("");
    };

  const handleLogin = (name?: string) => {
    if (name) setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      // On prévient le backend pour qu'il détruise le cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important pour que le backend sache quel cookie supprimer
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion backend :", err);
    } finally {
      // Quoi qu'il arrive (même si le réseau flanche), on déconnecte le front
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  return (
    <>
      <Routes>
        <Route path="/quiz" element={<QuizCallback authChecked={authChecked} />} />
        <Route path="/2fa" element={<LoginPage force2FA onLogin={handleLogin} />} />

        <Route element={<RequireAuth authChecked={authChecked} isLoggedIn={isLoggedIn} onLogin={handleLogin} />}>
          <Route element={<Layout username={username} onLogout={handleLogout} />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={<ProfilePage username={username} onBack={() => navigate("/")} />}
            />
            <Route
              path="/tournament"
              element={
                <TournamentLobby
                  username={username}
                  onBack={() => navigate("/")}
                  onStartGame={() => navigate("/game/tournament")}
                />
              }
            />
            <Route path="/game/:mode" element={<GameRoute />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 flex justify-between items-center text-white">
              <span className="font-bold">Chat Global</span>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto flex flex-col gap-3">
              {Array.isArray(messages) && messages.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-4">Aucun message pour l'instant...</p>
              ) : (
                Array.isArray(messages) && messages.map((msg, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs font-bold text-gray-600 ml-1">
                      {msg.author?.username || "Inconnu"}
                    </span>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-fit max-w-[85%] text-sm text-gray-800 mt-1">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
  }
