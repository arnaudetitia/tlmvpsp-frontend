import { Question } from './question.model';

export interface Defi {
  libelleTheme: string;
  questionsDefi: QuestionDefi[];
}

export interface QuestionDefi extends Question {
  ordre: number;
}
