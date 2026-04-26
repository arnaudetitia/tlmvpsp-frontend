export interface PanneauJoueur {
  joueur: string;
  score: number;
  statut?: StatutJoueur;
  reponseJoueur?: string;
  bonneReponseGiven?: boolean;
}

export enum StatutJoueur {
  QUALIFIE = 'Qualifié',
  BALLOTAGE = 'Ballotage',
  ELIMINE = 'Eliminé',
  CHALLENGER = 'Challenger',
  CHAMPION = 'Champion',
}
