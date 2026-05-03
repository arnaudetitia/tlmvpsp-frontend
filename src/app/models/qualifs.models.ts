import { TriTypeEnum } from './tri.enum';

export interface QuestionQualif {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  musique: string;
  tri: TriTypeEnum;
  joueeApresQuestion: boolean;
}
