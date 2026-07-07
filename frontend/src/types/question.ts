export interface Question
{
    question: string;
    answers: {
		label: string;
		value: string;
	}[];
    correct: string;
	//category: string;
	//difficulty: "easy" | "medium" | "hard";
}
