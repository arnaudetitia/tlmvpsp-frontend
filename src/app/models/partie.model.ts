export interface Partie {
  id: number;
  nomPartie: string;
  questionsQualifs: {
    question: string;
    bonneReponse: string;
  }[];
  themeCompet: string;
  themesDefi: string[];
  champion: string;
}

export interface LigneeChampion {
  id: number;
  nomLignee: string;
  nomChampion: string;
}

export interface QuestionQualifDesc {
  id: number;
  question: string;
  bonneReponse: string;
}

export interface Theme {
  id: number;
  libelle: string;
}

export interface ThemeCompet extends Theme {}
export interface ThemeDefi extends Theme {}
