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
                <span className="text-sm font-bold text-violet-800 uppercase tracking-wide">STREAK :</span>
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
                    doublePoint ? 'border-green-600 bg-pink-50 shadow-md scale-105' : 'border-gray-200 bg-gray-50 opacity-40 grayscale'
                }`}>
                    <span className="text-xs font-bold text-green-700">Points x2</span>
                </div>
            </div>

        </div>
    );
}

/* import { EyeOff, Flame, Layers3, Sparkles } from "lucide-react";

interface Props {
    streak: number;
    threeChoice: boolean;
    hideAnswer: boolean;
    doublePoint: boolean;
}

function BonusRow({
    icon,
    title,
    active,
    unlock,
}: {
    icon: React.ReactNode;
    title: string;
    active: boolean;
    unlock: number;
}) {
    return (
        <div className="flex items-center justify-between text-sm">

            <div className="flex items-center gap-2 text-white/80">
                {icon}
                <span>{title}</span>
            </div>

            {active ? (
                <span className="text-emerald-400 font-semibold">
                    READY
                </span>
            ) : (
                <span className="text-white/40">
                    x{unlock}
                </span>
            )}

        </div>
    );
}

export default function BonusBar({
    streak,
    threeChoice,
    hideAnswer,
    doublePoint,
}: Props) {
    return (

        <div className="absolute top-32 center-8 w-52 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-xl p-4">

            <div className="flex items-center gap-2 mb-4">

                <Flame className="w-5 h-5 text-orange-400"/>

                <span className="text-white font-bold">
                    Streak : {streak}
                </span>

            </div>

            <div className="space-y-3">

                <BonusRow
                    icon={<Layers3 className="w-4 h-4 text-cyan-300"/>}
                    title="Only 3 choices !"
                    active={threeChoice}
                    unlock={2}
                />

                <BonusRow
                    icon={<EyeOff className="w-4 h-4 text-pink-300"/>}
                    title="Hide an answer for your opponent !"
                    active={hideAnswer}
                    unlock={3}
                />

                <BonusRow
                    icon={<Sparkles className="w-4 h-4 text-yellow-300"/>}
                    title="2 points !"
                    active={doublePoint}
                    unlock={5}
                />

            </div>

        </div>

    );
}*/
