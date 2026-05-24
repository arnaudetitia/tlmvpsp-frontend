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
