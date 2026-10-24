import { TriTypeEnum } from './enums/tri.enum';

export interface Question {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  musiqueQuestion: string;
  musiqueReponse: string;
  tri: TriTypeEnum;
}

export interface QuestionExtended {
  id: number;
  mancheQuestion: string;
  idTheme: number;
  libelleTheme: string;
  question: string;
  ordre: number;
  bonneReponse: string;
  mauvaisesReponses: string[];
  tri: string;
  aliases: string[];
  musiqueQuestion: string;
  musiqueReponse: string;
}

export interface QuestionVo {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  tri: string;
  aliases: string[];
  musiqueQuestion: string;
  musiqueReponse: string;
}
