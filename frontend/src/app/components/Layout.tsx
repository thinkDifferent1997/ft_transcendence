import { Sparkles, LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

interface LayoutProps {
  username: string;
  onLogout: () => void;
}

export default function Layout({ username, onLogout }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Bloc de Gauche : Logo et Titre */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Culture Quiz
            </span>
          </div>

          {/* Bloc de Droite : Profil et Déconnexion */}
          <div className="flex items-center gap-4">

            {/* Bouton Profil */}
            <button
              onClick={() => navigate("/profile")}
              className="group flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <span className="text-white font-medium">{username}</span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl ring-2 ring-white/50">
                😊
              </div>
            </button>

            {/* Bouton Déconnexion */}
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </div>
      </nav>

      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  );
}
