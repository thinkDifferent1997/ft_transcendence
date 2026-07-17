import { useCallback, useEffect, useState } from "react";

interface AuthSession {
  authChecked: boolean;
  isLoggedIn: boolean;
  username: string;
  setUsername: (username: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  recheckSession: () => Promise<void>;
}

export default function useAuthSession(): AuthSession {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Joueur");

  const recheckSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.username) {
          setUsername(data.username);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    recheckSession();
  }, [recheckSession]);

  return { authChecked, isLoggedIn, username, setUsername, setIsLoggedIn, recheckSession };
}
