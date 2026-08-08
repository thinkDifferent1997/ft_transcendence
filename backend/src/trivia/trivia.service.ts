import { Injectable } from '@nestjs/common';

/**
 * The subset of the-trivia-api.com/v2 payload we consume.
 *
 * `difficulty` is the API's own vocabulary: it returns "medium", never
 * "normal". GameSession keeps both spellings because the local fallback
 * questions below use "normal" — see the note there.
 */
interface TriviaApiQuestion {
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

@Injectable()
export class TriviaService {
  async getQuestions() {
    try {
      const response = await fetch(
        'https://the-trivia-api.com/v2/questions?limit=8',
      );

      if (!response.ok)
        throw new Error(`Trivia API returned ${response.status}`);

      const data: unknown = await response.json();

      if (!Array.isArray(data))
        throw new Error('Trivia API returned an unexpected payload');

      return (data as TriviaApiQuestion[]).map((question) => ({
        question: question.question.text,
        correct: question.correctAnswer,
        answers: [question.correctAnswer, ...question.incorrectAnswers].sort(
          () => Math.random() - 0.5,
        ),
        difficulty: question.difficulty,
        category: question.category,
      }));
    } catch (error) {
      // L'API tierce peut être injoignable ou limiter le débit :
      // on retombe sur des questions locales plutôt que de laisser
      // le matchmaking bloqué avec un joueur en attente jamais libéré.
      console.error('Failed to fetch trivia questions, using fallback:', error);
      return this.getTestQuestions();
    }
  }
  getTestQuestions() {
    return [
      {
        question: '2 + 2 = ?',
        correct: '4',
        answers: ['4', '3', '5', '22'],
        difficulty: 'easy' as const,
        category: 'Maths',
      },
      {
        question: 'Capitale de la France ?',
        correct: 'Paris',
        answers: ['Paris', 'Londres', 'Berlin', 'Madrid'],
        difficulty: 'easy' as const,
        category: 'Géographie',
      },
      {
        question: 'Le ciel est...',
        correct: 'Bleu',
        answers: ['Bleu', 'Vert', 'Rouge', 'Jaune'],
        difficulty: 'easy' as const,
        category: 'Culture générale',
      },
      {
        question: 'Combien y a-t-il de jours dans une semaine ?',
        correct: '7',
        answers: ['7', '5', '10', '30'],
        difficulty: 'easy' as const,
        category: 'Culture générale',
      },
      {
        question: 'La Terre est une...',
        correct: 'Planète',
        answers: ['Planète', 'Étoile', 'Lune', 'Comète'],
        difficulty: 'normal' as const,
        category: 'Science',
      },
      {
        question: '1 + 1 = ?',
        correct: '2',
        answers: ['2', '3', '1', '11'],
        difficulty: 'easy' as const,
        category: 'Maths',
      },
      {
        question: 'Le feu est...',
        correct: 'Chaud',
        answers: ['Chaud', 'Froid', 'Mouillé', 'Carré'],
        difficulty: 'easy' as const,
        category: 'Culture générale',
      },
      {
        question: "Combien de lettres dans 'Chat' ?",
        correct: '4',
        answers: ['4', '3', '5', '6'],
        difficulty: 'easy' as const,
        category: 'Culture générale',
      },
    ];
  }
}
