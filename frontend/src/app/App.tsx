import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import TournamentLobby from "./components/TournamentLobby";
import TournamentLobbyTest from "./pages/TournamentLobbyTest";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GameRoute from "./routes/GameRoute";
import RequireAuth from "./routes/RequireAuth";
import QuizCallback from "./routes/QuizCallback";
import useAuthSession from "./hooks/useAuthSession";

export default function App() {
  const { authChecked, isLoggedIn, username, setUsername, setIsLoggedIn } = useAuthSession();
  const navigate = useNavigate();

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
             // <TournamentLobby
              <TournamentLobbyTest
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
  );
}
