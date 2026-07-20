import { Socket } from "socket.io";

export interface QuestionHistory {
    question: string;
    category: string;

    correctAnswer: string;

    player1Answer: string | null;
    player2Answer: string | null;

    player1Correct: boolean;
    player2Correct: boolean;
}

export class GameSession
{
    constructor(
        public readonly roomId: string,
        public readonly player1: Socket,
        public readonly player2: Socket,
    ) {}

    questions: {
		question: string;
		correct: string;
		answers: string[];
		difficulty: "easy" | "normal" | "hard",
		category : string,
	}[] = [];

    currentQuestion = 0;

	//Scoreboard

    player1Score = 0;
    player2Score = 0;

	player1Time = 0;
	player2Time = 0;
	
	//Match synchronization

	player1Answered = false;
    player2Answered = false;

	player1QuestionsLoaded = false;
	player2QuestionsLoaded = false;

	player1Ready = false;
	player2Ready = false;

	//Bonus

	player1Streak = 0;
	player2Streak = 0;

	player1ThreeChoice = false;
	player2ThreeChoice = false;

	player1HideAnswer = false;
	player2HideAnswer = false;

	player1DoublePoint = false;
	player2DoublePoint = false;

	questionHistory: QuestionHistory[] = [];

}

export interface MatchStats {
    winner: string;

    player1Id: string;
    player2Id: string;

    player1Score: number;
    player2Score: number;

    questions: QuestionHistory[];
}
