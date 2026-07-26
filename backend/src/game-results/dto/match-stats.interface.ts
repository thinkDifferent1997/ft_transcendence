export interface QuestionHistoryInput {
  question: string;
  category: string;
  correctAnswer: string;
  player1Answer: string | null;
  player2Answer: string | null;
  player1Correct: boolean;
  player2Correct: boolean;
}

export interface MatchStatsInput {
  winner: 0 | 1 | 2;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  questions: QuestionHistoryInput[];
}