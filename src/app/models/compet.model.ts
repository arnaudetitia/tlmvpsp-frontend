import { ModeQuestion } from './mode-question.models';
import { Question } from './question.model';

export interface Compet {
  libelleTheme: string;
  questionsCompet: QuestionCompet[];
}

export interface JoueurCompet {
  nomJoueur: string;
}

export interface QuestionCompet extends Question {
  mode: ModeQuestion;
  ordre: number;
  aliases: string[];
}
