import { Injectable } from "@nestjs/common";

@Injectable()
export class TriviaService
{
	async getQuestions()
    {
		const response = await fetch(
		"https://the-trivia-api.com/v2/questions?limit=8"
        );

        const data = await response.json();

        return data.map((question) => ({
                question: question.question.text,
                correct: question.correctAnswer,
                answers: [
                        question.correctAnswer,
                        ...question.incorrectAnswers,
                ].sort(() => Math.random() - 0.5),
        }));
    }
}
