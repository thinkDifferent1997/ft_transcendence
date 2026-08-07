import { useCallback, useEffect, useState } from "react";

interface AuthSession {
  authChecked: boolean;
  isLoggedIn: boolean;
  /**
   * Premier facteur franchi, second encore dû. L'utilisateur n'est pas
   * connecté (isLoggedIn reste false) mais on doit lui redemander son
   * code plutôt que ses identifiants.
   */
  twoFactorPending: boolean;
  isTwoFactorEnabled: boolean;
  username: string;
  userId: string;
  setUsername: (username: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  recheckSession: () => Promise<void>;
}

export default function useAuthSession(): AuthSession {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [username, setUsername] = useState("Joueur");
  const [userId, setUserId] = useState("");

  const recheckSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setTwoFactorPending(Boolean(data?.twoFactorPending));
      if (data && data.authenticated) {
        setUsername(data.username);
        setUserId(data.userId ?? "");
        setIsTwoFactorEnabled(Boolean(data.isTwoFactorEnabled));
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setIsTwoFactorEnabled(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    recheckSession();
  }, [recheckSession]);

  return {
    authChecked,
    isLoggedIn,
    twoFactorPending,
    isTwoFactorEnabled,
    username,
    userId,
    setUsername,
    setIsLoggedIn,
    recheckSession,
  };
}
