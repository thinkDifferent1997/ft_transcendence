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

    player1Score = 0;
    player2Score = 0;

	player1Answered = false;
    player2Answered = false;

	player1Streak = 0;
	player2Streak = 0;

	player1ThreeChoice = false;
	player2ThreeChoice = false;

	player1HideAnswer = false;
	player2HideAnswer = false;

//	player1HiddenAnswer = -1;
//	player2HiddenAnswer = -1;

	player1DoublePoint = false;
	player2DoublePoint = false;
}
