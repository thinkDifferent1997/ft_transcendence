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
				difficulty: question.difficulty,
				category: question.category,
        }));
    }
	async getTestQuestions()
{
    return [
        {
            question: "2 + 2 = ?",
            correct: "4",
            answers: ["4", "3", "5", "22"],
        },
        {
            question: "Capitale de la France ?",
            correct: "Paris",
            answers: ["Paris", "Londres", "Berlin", "Madrid"],
        },
        {
            question: "Le ciel est...",
            correct: "Bleu",
            answers: ["Bleu", "Vert", "Rouge", "Jaune"],
        },
        {
            question: "Combien y a-t-il de jours dans une semaine ?",
            correct: "7",
            answers: ["7", "5", "10", "30"],
        },
        {
            question: "La Terre est une...",
            correct: "Planète",
            answers: ["Planète", "Étoile", "Lune", "Comète"],
        },
        {
            question: "1 + 1 = ?",
            correct: "2",
            answers: ["2", "3", "1", "11"],
        },
        {
            question: "Le feu est...",
            correct: "Chaud",
            answers: ["Chaud", "Froid", "Mouillé", "Carré"],
        },
        {
            question: "Combien de lettres dans 'Chat' ?",
            correct: "4",
            answers: ["4", "3", "5", "6"],
        },
    ];
}
}
