import { Outlet } from "react-router-dom";
import LoginPage from "../components/LoginPage";

interface RequireAuthProps {
  authChecked: boolean;
  isLoggedIn: boolean;
  onLogin: (username?: string) => void;
}

export default function RequireAuth({ authChecked, isLoggedIn, onLogin }: RequireAuthProps) {
  if (!authChecked) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={onLogin} />;
  }

  return <Outlet />;
}
