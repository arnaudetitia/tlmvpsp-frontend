import { TriTypeEnum } from './tri.enum';

export interface Defi {
  libelleTheme: string;
  questionsDefi: QuestionDefi[];
}

export interface QuestionDefi {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  tri: TriTypeEnum;
  ordre: number;
}
