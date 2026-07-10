import { Trophy, Target, TrendingUp, Star, Camera, Award, Zap, Shield, QrCode, X, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ProfilePageProps {
  username: string;
  onBack?: () => void;
}

export default function ProfilePage({ username, onBack }: ProfilePageProps) {
  const [avatar, setAvatar] = useState("😊");

  // États pour le 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error2FA, setError2FA] = useState("");

  // Données utilisateur
  const userData = {
    name: username,
    level: 15,
    totalGames: 127,
    globalAccuracy: 78,
    tournamentWins: 5,
    rank: "#342",
  };

  const themeStats = [
    { theme: "Histoire", accuracy: 85, games: 45, color: "from-blue-500 to-cyan-500" },
    { theme: "Sciences", accuracy: 72, games: 32, color: "from-purple-500 to-pink-500" },
    { theme: "Arts", accuracy: 81, games: 28, color: "from-orange-500 to-red-500" },
    { theme: "Géographie", accuracy: 76, games: 22, color: "from-green-500 to-emerald-500" },
  ];

  const emojis = ["😊", "🎨", "🚀", "🌟", "🎯", "🔥", "💫", "🎮", "🏆", "⚡"];

  // Demander le QR Code au backend
  const handleSetup2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST", // 🔴 MODIFIÉ ICI : POST au lieu de GET
        credentials: "include",
      });
      
      if (!res.ok) {
        alert("Erreur réseau : Le backend a refusé la requête.");
        return;
      }

      const data = await res.json();
      
      if (data && data.qrCodeDataUrl) { 
        setQrCodeUrl(data.qrCodeDataUrl); 
        setShow2FAModal(true);
      } else {
        alert("Erreur : Le QR Code n'a pas été reçu.");
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de joindre le serveur.");
    }
  };
 
  // Valider le code du téléphone
  const handleEnable2FA = async () => {
    setError2FA("");
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: verificationCode }),
      });
      
      if (res.ok) {
        setIs2FAEnabled(true);
        setShow2FAModal(false);
        setVerificationCode("");
      } else {
        const data = await res.json();
        setError2FA(data.message || "Code invalide.");
      }
    } catch (err) {
      setError2FA("Erreur de connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 p-8 relative">
      
      {/* MODAL 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95">
            <button 
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Activer le 2FA</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Scannez ce QR Code avec Google Authenticator ou Authy.
              </p>
            </div>

            <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-lg shadow-sm" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400 animate-pulse">Chargement...</div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Ex: 123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-center tracking-widest text-lg font-bold outline-none transition-all"
                />
              </div>
              
              {error2FA && <p className="text-red-500 text-sm text-center font-medium">{error2FA}</p>}

              <button
                onClick={handleEnable2FA}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Confirmer l'activation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
        )}

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-6xl">
                  {avatar}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-2xl p-3 grid grid-cols-5 gap-2 border border-purple-200">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatar(emoji)}
                        className="w-10 h-10 rounded-lg hover:bg-purple-100 transition-all text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                <h1 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-4xl font-extrabold m-0">
                  {userData.name}
                </h1>
                {is2FAEnabled && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200 shadow-sm">
                    <CheckCircle className="w-4 h-4" /> 2FA Sécurisé
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md font-medium">
                  Niveau {userData.level}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md font-medium">
                  Rang {userData.rank}
                </span>
              </div>

              {!is2FAEnabled && (
                <button 
                  onClick={handleSetup2FA}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  Sécuriser mon compte (Activer 2FA)
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-6 md:mt-0">
              <div className="px-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent text-2xl font-bold">
                  {userData.totalGames}
                </div>
                <div className="text-sm text-gray-600 font-medium">Parties</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">
                  {userData.globalAccuracy}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Précision</div>
              </div>
              <div className="px-4">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-2xl font-bold">
                  {userData.tournamentWins}
                </div>
                <div className="text-sm text-gray-600 font-medium">Victoires</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Statistiques globales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{userData.totalGames}</div>
                <div className="opacity-90 font-medium">Parties jouées</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{userData.globalAccuracy}%</div>
                <div className="opacity-90 font-medium">Taux de réussite global</div>
              </div>

              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <div className="mb-2 text-3xl font-black">{userData.tournamentWins}</div>
                <div className="opacity-90 font-medium">Victoires en tournoi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Stats */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Target className="w-6 h-6 text-indigo-600" />
            Statistiques par thème
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themeStats.map((stat, index) => (
              <div key={index} className="space-y-3 bg-white/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 m-0">{stat.theme}</h4>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-black`}>
                      {stat.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r ${stat.color} h-3 rounded-full transition-all shadow-md`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium text-right m-0">{stat.games} parties jouées</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
