interface ScoreBoardProps {
    score: number;
    enemyScore: number;
    time_left: number;
}

export default function ScoreBoard({ score, enemyScore, time_left }: ScoreBoardProps) {
    return (
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-6 bg-white/80 backdrop-blur-md px-8 py-4 rounded-3xl shadow-md border border-white/40">
            
            {/* Ton Score */}
            <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Ton Score</span>
                <span className="text-3xl md:text-4xl font-black text-indigo-600">{score}</span>
            </div>

            {/* Timer Central */}
            <div className="flex flex-col items-center justify-center -mt-8">
                <div className={`w-20 h-20 flex items-center justify-center rounded-full border-4 shadow-xl bg-white transition-colors duration-300 ${
                    time_left <= 5 
                    ? 'border-red-500 text-red-500 animate-pulse scale-110' 
                    : 'border-purple-500 text-purple-600'
                }`}>
                    <span className="font-black text-3xl">{time_left}</span>
                </div>
            </div>

            {/* Score Adversaire */}
            <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Adversaire</span>
                <span className="text-3xl md:text-4xl font-black text-pink-500">{enemyScore}</span>
            </div>
            
        </div>
    );
}
