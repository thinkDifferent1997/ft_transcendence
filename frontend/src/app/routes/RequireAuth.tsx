import { Outlet } from "react-router-dom";
import LoginPage from "../components/LoginPage";

interface RequireAuthProps {
  authChecked: boolean;
  isLoggedIn: boolean;
  twoFactorPending: boolean;
  onLogin: () => void;
}

export default function RequireAuth({
  authChecked,
  isLoggedIn,
  twoFactorPending,
  onLogin,
}: RequireAuthProps) {
  if (!authChecked) {
    return null;
  }

  // Si le premier facteur est déjà franchi, on redemande le code et non
  // les identifiants : recharger la page pendant le défi 2FA ne doit ni
  // faire entrer dans l'app, ni obliger à ressaisir email/mot de passe.
  if (!isLoggedIn) {
    return <LoginPage force2FA={twoFactorPending} onLogin={onLogin} />;
  }

  return <Outlet />;
}
