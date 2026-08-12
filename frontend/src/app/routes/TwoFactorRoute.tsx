import { Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";

interface TwoFactorRouteProps {
  authChecked: boolean;
  isLoggedIn: boolean;
  twoFactorPending: boolean;
  onLogin: () => void;
}

/**
 * Page du défi 2FA, cible de la redirection des callbacks OAuth
 * (/api/auth/42/callback et /api/auth/github/callback) quand le second
 * facteur est encore dû. Contrairement au login par mot de passe — qui
 * reste sur sa route et laisse RequireAuth rendre l'app dès que la
 * session devient valide — l'OAuth arrive ici par une vraie navigation :
 * sans sortie explicite, l'utilisateur resterait bloqué sur le formulaire
 * OTP une fois son code accepté.
 */
export default function TwoFactorRoute({
  authChecked,
  isLoggedIn,
  twoFactorPending,
  onLogin,
}: TwoFactorRouteProps) {
  // Ne rien monter avant la réponse de /api/auth/me : LoginPage fige
  // force2FA dans un useState au premier rendu, un montage prématuré
  // afficherait donc le formulaire identifiants au lieu du code.
  if (!authChecked) {
    return null;
  }

  // Second facteur franchi : la page n'a plus lieu d'être.
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage force2FA={twoFactorPending} onLogin={onLogin} />;
}
