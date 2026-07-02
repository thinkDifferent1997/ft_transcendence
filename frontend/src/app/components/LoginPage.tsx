import { Sparkles, Mail, Lock, User, AlertCircle, Key } from "lucide-react";
import { useState, useEffect } from "react"; // 🔴 AJOUT DE useEffect ICI

interface LoginPageProps {
  onLogin?: (username?: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // 🔴 NOUVEAU : L'ANTENNE POUR CAPTER LE RETOUR DE 42
  useEffect(() => {
    // Si l'URL est /quiz, on vient d'être redirigé par le backend après le login 42
    if (window.location.pathname === "/quiz") {
      fetch("https://localhost:8443/api/users/me", {
        credentials: 'include', // On envoie le cookie JWT fraîchement reçu
      })
        .then(async (res) => {
          const data = await res.json();
          return { ok: res.ok, data };
        })
        .then(({ ok, data }) => {
          if (ok && data && data.username) {
            // 1. Session valide ! On connecte l'utilisateur
            if (onLogin) onLogin(data.username);
            // On nettoie la barre d'adresse
            window.history.replaceState({}, document.title, "/");
          } else if (data && data.twoFactorRequired) {
            // 2. 42 est passé, mais le backend exige le 2FA
            setIs2FARequired(true);
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch((err) => {
          console.error("Aucune session valide trouvée :", err);
        });
    }
  }, [onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const endpoint = is2FARequired 
      ? '/api/auth/2fa/verify' 
      : (isSignUp ? '/api/auth/register' : '/api/auth/login');
      
    const payload = is2FARequired 
      ? { code: twoFactorCode } 
      : (isSignUp ? { email, username, password } : { email, password });

    try {
      const response = await fetch(`https://localhost:8443${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          setIsSignUp(false);
          setErrorMsg("Compte créé avec succès ! Connectez-vous.");
          return;
        }

        if (!is2FARequired && data.twoFactorRequired) {
          setIs2FARequired(true);
          return;
        }

        console.log("Connecté avec succès !", data);
        if (onLogin) onLogin(data.username || username); 
      } else {
        setErrorMsg(data.message || "Erreur lors de la connexion");
      }
    } catch (error) {
      console.error("Network Error:", error);
      setErrorMsg("Impossible de contacter le serveur NestJS.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 flex items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-4 shadow-xl animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-4xl font-extrabold">
            Culture Quiz
          </h1>
          <p className="text-gray-600">
            {is2FARequired 
              ? "Vérification en deux étapes" 
              : (isSignUp ? "Créez votre compte pour commencer" : "Bienvenue ! Connectez-vous pour continuer")}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
          
          {/* Banner d'erreur dynamique */}
          {errorMsg && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in ${errorMsg.includes("succès") ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600"}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {is2FARequired ? (
              <div>
                <label className="block mb-2 text-gray-700 font-medium text-sm">Code d'authentification (OTP)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all text-center tracking-widest text-lg font-semibold"
                    required
                    maxLength={6}
                  />
                </div>
              </div>
            ) : (
              <>
                {isSignUp && (
                  <div>
                    <label className="block mb-2 text-gray-700 font-medium text-sm">Nom d'utilisateur</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Votre pseudo"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-gray-700 font-medium text-sm">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-700 font-medium text-sm">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {!isSignUp && !is2FARequired && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              {is2FARequired ? "Vérifier le code" : (isSignUp ? "Créer mon compte" : "Se connecter")}
            </button>
          </form>

          {!is2FARequired && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-400 font-medium">ou continuer avec</span>
                </div>
              </div>

              <a
                href="https://localhost:8443/api/auth/42"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-decoration-none text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">42</span>
                </div>
                <span>Se connecter avec l'intra 42</span>
              </a>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg("");
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
                >
                  {isSignUp ? (
                    <>Vous avez déjà un compte ? <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold underline">Se connecter</span></>
                  ) : (
                    <>Pas encore de compte ? <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold underline">S'inscrire</span></>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
