import { ModeQuestion } from './mode-question.models';
import { TriTypeEnum } from './tri.enum';

export interface Compet {
  libelle_theme: string;
  questions_compet: QuestionCompet[];
}

export interface JoueurCompet {
  nomJoueur: string;
}

export interface QuestionCompet {
  question: string;
  mode: ModeQuestion;
  bonne_reponse: string;
  mauvaises_reponses: string[];
  tri: TriTypeEnum;
  ordre: number;
  musique: string;
  jouee_apres_question: boolean;
  aliases: string[];
}
