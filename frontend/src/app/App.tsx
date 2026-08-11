import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { socket, statsSocket } from "../socket/socket";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import LeaderboardPage from "./pages/Leaderboard";
import TournamentLobbyTest from "./pages/TournamentLobbyTest";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GameRoute from "./routes/GameRoute";
import RequireAuth from "./routes/RequireAuth";
import QuizCallback from "./routes/QuizCallback";
import useAuthSession from "./hooks/useAuthSession";
import { socket } from "../socket/socket";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

export default function App() {
  const {
    authChecked,
    isLoggedIn,
    twoFactorPending,
    isTwoFactorEnabled,
    username,
    userId,
    recheckSession,
    setIsLoggedIn,
  } = useAuthSession();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Le backend ne renvoie pas le username dans la réponse de login/2FA :
    // on relit /api/auth/me pour récupérer le vrai profil depuis le cookie
    // qui vient d'être posé, plutôt que de faire confiance à une valeur
    // locale potentiellement vide.
    await recheckSession();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion backend :", err);
    } finally {
      setIsLoggedIn(false);
	  socket.disconnect();
      navigate("/");
    }
  };

  return (
    <Routes>
      <Route path="/quiz" element={<QuizCallback authChecked={authChecked} />} />
      <Route path="/2fa" element={<LoginPage force2FA onLogin={handleLogin} />} />
	  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
	  <Route path="/terms-of-service" element={<TermsOfService />} />

      <Route
        element={
          <RequireAuth
            authChecked={authChecked}
            isLoggedIn={isLoggedIn}
            twoFactorPending={twoFactorPending}
            onLogin={handleLogin}
          />
        }
      >
        <Route element={<Layout username={username} onLogout={handleLogout} />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                username={username}
                userId={userId}
                isTwoFactorEnabled={isTwoFactorEnabled}
                onTwoFactorChange={recheckSession}
                onBack={() => navigate("/")}
              />
            }
          />
          <Route 
            path= "/profile/:targetUsername"
            element={<ProfilePage username={username} onBack={() => navigate("/")} />}
          />
          <Route
            path="/leaderboard"
            element={<LeaderboardPage userId={userId} onBack={() => navigate("/")} />}
          />
          <Route
            path="/tournament"
            element={
				<TournamentLobbyTest
					username={username}
					onBack={() => navigate("/")}
					onStartGame={(matchData) =>
						navigate("/game/tournament", {
							state: matchData,
						})
					}
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
