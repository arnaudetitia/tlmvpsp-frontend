import { ModeQuestion } from '../../../models/mode-question.models';

export interface RecapDefiChallenger {
  theme: string;

  recapQuestions: RecapQuestion[];
}

export interface RecapQuestion {
  question: string;
  modeQuestion: ModeQuestion | null;
  propositions: string[];
  reponseDonnee: string;
  bonneReponse: string;
}
