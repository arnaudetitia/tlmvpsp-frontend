import { TriTypeEnum } from './tri.enum';

export interface QuestionQualif {
  question: string;
  bonne_reponse: string;
  mauvaises_reponses: string[];
  musique: string;
  tri: TriTypeEnum;
  jouee_apres_question: boolean;
}
