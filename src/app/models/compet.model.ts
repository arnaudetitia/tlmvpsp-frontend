import { ModeQuestion } from './mode-question.models';

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
  ordre: number;
  musique: string;
  aliases: string[];
}
