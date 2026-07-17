import { Navigate } from "react-router-dom";

interface QuizCallbackProps {
  authChecked: boolean;
}

export default function QuizCallback({ authChecked }: QuizCallbackProps) {
  if (!authChecked) {
    return null;
  }

  return <Navigate to="/" replace />;
}
