export interface Question
{
    question: string;
    answers: string[];
    correct: string;
	category: string;
	difficulty: "easy" | "medium" | "hard";
}
