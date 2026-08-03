import { useCallback, useEffect, useState } from "react";

interface AuthSession {
  authChecked: boolean;
  isLoggedIn: boolean;
  username: string;
  userId: string;
  setUsername: (username: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  recheckSession: () => Promise<void>;
}

export default function useAuthSession(): AuthSession {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("Joueur");
  const [userId, setUserId] = useState("");

  const recheckSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data && data.authenticated) {
        setUsername(data.username);
        setUserId(data.userId ?? "");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
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

  return { authChecked, isLoggedIn, username, userId, setUsername, setIsLoggedIn, recheckSession };
}
