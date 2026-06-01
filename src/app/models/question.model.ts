import { TriTypeEnum } from './enums/tri.enum';

export interface Question {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  musique: string;
  tri: TriTypeEnum;
  joueeApresQuestion: boolean;
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
  musique: string;
  joueeApresQuestion: boolean;
}

export interface QuestionVo {
  question: string;
  bonneReponse: string;
  mauvaisesReponses: string[];
  tri: string;
  aliases: string[];
  musique: string;
  joueeApresQuestion: boolean;
}
