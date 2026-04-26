import { Injectable } from '@angular/core';
import { PanneauJoueur } from '../models/score.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EtatPartieKeys } from '../models/etat-partie.enum';

@Injectable({ providedIn: 'root' })
export class ScoresStore {
  panneauxJoueurs: PanneauJoueur[] = [];

  panneauxJoueursSource = new BehaviorSubject<PanneauJoueur[]>([]);
  panneauxJoueurs$ = this.panneauxJoueursSource.asObservable();

  initScores(noms: string[]) {
    this.setPanneauJoueurs(
      noms.map((nom) => {
        return {
          joueur: nom,
          score: 0,
        };
      }),
    );
  }

  setPanneauJoueurs(panneaux: PanneauJoueur[]) {
    this.panneauxJoueurs = [...panneaux];
    this.panneauxJoueursSource.next(this.panneauxJoueurs);
    localStorage.setItem(EtatPartieKeys.SCORES_JOUEURS, JSON.stringify(this.panneauxJoueurs));
  }

  getPanneauxJoueurs(): Observable<PanneauJoueur[]> {
    if (!this.panneauxJoueurs.length) {
      const savedPanneauxJoueurs = localStorage.getItem('scoresJoueurs');
      if (savedPanneauxJoueurs) {
        this.panneauxJoueurs = JSON.parse(savedPanneauxJoueurs);
      }
    }
    return of(this.panneauxJoueurs);
  }
}
