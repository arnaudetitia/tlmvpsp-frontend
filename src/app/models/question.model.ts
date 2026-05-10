import { TriTypeEnum } from './enums/tri.enum';

export interface Question {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string;
  musique: string;
  tri: TriTypeEnum;
  joueeApresQuestion: boolean;
}
