import { Socket } from "socket.io";

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

}
