import type { Question } from "../types/question";

type QuestionCardProps =
{
    question: Question;
    answers: {
        label: string;
        value: string;
    }[];
    onAnswer: (answer: string) => void;
};

export default function QuestionCard({ question, answers, onAnswer }: QuestionCardProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/40 w-full max-w-2xl mx-auto transform transition-all">
            {/* La Question */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 text-center leading-tight">
                {question.question}
            </h1>

            {/* La Grille des Réponses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {answers.map((answer) => (
                    <button
                        key={answer.value}
                        onClick={() => onAnswer(answer.value)}
                        className="relative group overflow-hidden px-6 py-4 rounded-xl bg-white border-2 border-indigo-100 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold text-gray-700 hover:text-indigo-600 active:scale-95"
                    >
                        <span className="relative z-10">{answer.label}</span>
                        {/* Effet de survol stylé */}
                        <div className="absolute inset-0 h-full w-full bg-indigo-50/50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 ease-out"></div>
                    </button>
                ))}
            </div>
        </div>
    );
}
