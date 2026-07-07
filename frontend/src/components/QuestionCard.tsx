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

export default function QuestionCard(
{
    question,
    answers,
    onAnswer,
}: QuestionCardProps)
{
    return (
        <div>
            <h1>{question.question}</h1>

            {answers.map((answer) => (
                <button
                    key={answer.value}
                    onClick={() => onAnswer(answer.value)}
                >
                    {answer.label}
                </button>
            ))}
        </div>
    );
}
