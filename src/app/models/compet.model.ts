import { ModeQuestion } from './mode-question.models';
import { TriTypeEnum } from './tri.enum';

export interface Compet {
  libelleTheme: string;
  questionsCompet: QuestionCompet[];
}

export interface JoueurCompet {
  nomJoueur: string;
}

export interface QuestionCompet {
  question: string;
  mode: ModeQuestion;
  bonneReponse: string;
  mauvaisesReponses: string[];
  tri: TriTypeEnum;
  ordre: number;
  musique: string;
  joueeApresQuestion: boolean;
  aliases: string[];
}
