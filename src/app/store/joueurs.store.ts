import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ScoresStore } from './scores.store';

@Injectable({ providedIn: 'root' })
export class JoueursStore {
  private joueursQualifs: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private joueursCompet: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private reponseJoueur: BehaviorSubject<{ joueur: string; reponse: string }> =
    new BehaviorSubject<{ joueur: string; reponse: string }>({ joueur: '', reponse: '' });
  private challenger: BehaviorSubject<string> = new BehaviorSubject<string>('');

  joueursQualifs$ = this.joueursQualifs.asObservable();
  joueursCompet$ = this.joueursCompet.asObservable();
  reponseJoueur$ = this.reponseJoueur.asObservable();
  challenger$ = this.challenger.asObservable();

  constructor(private scoresStore: ScoresStore) {}

  setJoueursQualifs(noms: string[]) {
    this.joueursQualifs.next(noms);
    this.scoresStore.initScores(noms);
  }

  setQualifiesCompet(noms: string[]) {
    this.joueursCompet.next(noms);
  }

  setChallenger(nom: string) {
    this.challenger.next(nom);
    this.scoresStore.initScores([nom]);
  }

  recordReponseJoueur(joueur: string, reponse: string) {
    this.reponseJoueur.next({ joueur, reponse });
  }

  get candidatsQualifs(): string[] {
    return this.joueursQualifs.getValue();
  }

  get qualifiesCompet(): string[] {
    return this.joueursCompet.getValue();
  }
}
