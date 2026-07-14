interface PlayerBonusProps {
    streak: number;
    threeChoice: boolean;
    hideAnswer: boolean;
    doublePoint: boolean;
}

export default function PlayerBonus({ streak, threeChoice, hideAnswer, doublePoint }: PlayerBonusProps) {
    return (
        <div className="w-full max-w-2xl mx-auto mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/40 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Streak (Série) */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Série :</span>
                <span className={`px-4 py-1 rounded-full text-sm font-black shadow-inner ${
                    streak > 0 ? 'bg-green-100 text-green-700' : 
                    streak < 0 ? 'bg-red-100 text-red-700' : 
                    'bg-gray-200 text-gray-600'
                }`}>
                    {streak > 0 ? `+${streak} 🔥` : streak < 0 ? `${streak} 🥶` : streak}
                </span>
            </div>

            {/* Indicateurs de Bonus */}
            <div className="flex gap-3">
                {/* 50/50 */}
                <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 transition-all ${
                    threeChoice ? 'border-indigo-400 bg-indigo-50 shadow-md scale-105' : 'border-gray-200 bg-gray-50 opacity-40 grayscale'
                }`}>
                    <span className="text-xs font-bold text-indigo-700">50 / 50</span>
                </div>
                
                {/* Cacher une réponse */}
                <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 transition-all ${
                    hideAnswer ? 'border-purple-400 bg-purple-50 shadow-md scale-105' : 'border-gray-200 bg-gray-50 opacity-40 grayscale'
                }`}>
                    <span className="text-xs font-bold text-purple-700">Cacher 1</span>
                </div>
                
                {/* Points x2 */}
                <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border-2 transition-all ${
                    doublePoint ? 'border-pink-400 bg-pink-50 shadow-md scale-105' : 'border-gray-200 bg-gray-50 opacity-40 grayscale'
                }`}>
                    <span className="text-xs font-bold text-pink-700">Points x2</span>
                </div>
            </div>

        </div>
    );
}
