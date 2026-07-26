import { Search, X } from "lucide-react";

interface Props {
    onCancel: () => void;
}

export default function MatchmakingScreen({ onCancel }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center px-6">

            <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-10">

                <div className="text-center">

                    <div className="inline-flex px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold mb-8">
                        PARTY MATCH
                    </div>

                    <div className="w-24 h-24 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center mx-auto mb-8 animate-pulse">

                        <Search className="w-12 h-12 text-violet-200"/>

                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3">
                        Searching for opponent...
                    </h1>

                    <p className="text-white/60 mb-8">
                        Finding a worthy challenger
                    </p>

                    <div className="flex justify-center gap-3 mb-10">

                        <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce"></div>
                        <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce delay-150"></div>
                        <div className="w-3 h-3 rounded-full bg-violet-400 animate-bounce delay-300"></div>

                    </div>

                    <button
                        onClick={onCancel}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
                    >
                        <X className="w-5 h-5"/>
                        Cancel Search
                    </button>

                </div>

            </div>

        </div>
    );
}
