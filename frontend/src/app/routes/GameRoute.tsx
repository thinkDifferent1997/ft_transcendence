import { Navigate, useNavigate, useParams } from "react-router-dom";
import GamePage from "../components/GamePage";
import PartyGame from "../components/PartyGame";

const VALID_MODES = ["solo", "ai", "party", "tournament"] as const;
type GameMode = (typeof VALID_MODES)[number];

function isGameMode(value: string | undefined): value is GameMode {
  return !!value && (VALID_MODES as readonly string[]).includes(value);
}

export default function GameRoute() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();

  if (!isGameMode(mode)) {
    return <Navigate to="/" replace />;
  }

  const onBack = () => navigate("/");

  if (mode === "tournament") {
    return <PartyGame />;
  }

  if (mode === "party") {
    return <PartyGame />;
  }

  return <GamePage mode={mode} onBack={onBack} />;
}
