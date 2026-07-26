export interface Question
{
    question: string;
    answers: {
		label: string;
		value: string;
	}[];
	answeredQuestions: {
		question: Question;
		playerAnswer: string | null;
	}[];
    correct: string;
	category: string;
	difficulty: "easy" | "medium" | "hard";
}
