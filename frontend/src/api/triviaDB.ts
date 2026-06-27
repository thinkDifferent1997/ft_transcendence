import type { Question } from "../types/question";

export async function fetchQuestions(): Promise<Question[]>
{
    const response = await fetch(
        "https://the-trivia-api.com/v2/questions?limit=8"
    );

    const data = await response.json();

    return data.map((question: any) =>
    ({
        question: question.question.text,
        correct: question.correctAnswer,
        answers:
        [
            question.correctAnswer,
            ...question.incorrectAnswers,
        ].sort(() => Math.random() - 0.5),
    }));
}
