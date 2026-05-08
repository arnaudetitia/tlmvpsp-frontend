import { Injectable } from '@angular/core';
import { EtatCompet } from '../models/etat-compet.enum';
import { BehaviorSubject, of } from 'rxjs';
import { EtatPartieKeys } from '../models/etat-partie.enum';
import { PartieStore } from './partie.store';

@Injectable({
  providedIn: 'root',
})
export class CompetStore {
  etatCompet: EtatCompet = EtatCompet.START_QUESTION_NORMALE;

  etatCompetSource = new BehaviorSubject<EtatCompet>(EtatCompet.START_QUESTION_NORMALE);
  etatCompet$ = this.etatCompetSource.asObservable();

  indexCurrentQuestion = 0;

  indexCurrentQuestionSource = new BehaviorSubject<number>(0);
  indexCurrentQuestion$ = this.indexCurrentQuestionSource.asObservable();

  constructor(private partieStore: PartieStore) {}

  passerEtatSuivant() {
    switch (this.etatCompet) {
      case EtatCompet.START_QUESTION_NORMALE:
        this.etatCompet = EtatCompet.QUESTION_NORMALE_POSEE;
        break;
      case EtatCompet.QUESTION_NORMALE_POSEE:
        this.etatCompet = EtatCompet.VOTES_OUVERTS;
        break;
      case EtatCompet.VOTES_OUVERTS:
        this.etatCompet = EtatCompet.VOTES_FERMES;
        break;
      case EtatCompet.VOTES_FERMES:
        this.etatCompet = EtatCompet.BONNE_REPONSE_AFFICHEE;
        break;
      case EtatCompet.BONNE_REPONSE_AFFICHEE:
        if (this.indexCurrentQuestion === 7) {
          this.etatCompet = EtatCompet.START_QUESTION_SUPER_CASH;
        } else {
          this.passerQuestionSuivante();
          this.etatCompet = EtatCompet.START_QUESTION_NORMALE;
        }
        break;
      case EtatCompet.START_QUESTION_SUPER_CASH:
        this.etatCompet = EtatCompet.QUESTION_SUPER_CASH_CHOISIE;
        break;
      case EtatCompet.QUESTION_SUPER_CASH_CHOISIE:
        this.etatCompet = EtatCompet.QUESTION_SUPER_CASH_POSEE;
        break;
      case EtatCompet.QUESTION_SUPER_CASH_POSEE:
        this.etatCompet = EtatCompet.CHRONO_SUPER_CASH_LANCE;
        break;
      case EtatCompet.CHRONO_SUPER_CASH_LANCE:
        this.etatCompet = EtatCompet.REPONSE_SUPER_CASH_DONNEE;
        break;
      case EtatCompet.REPONSE_SUPER_CASH_DONNEE:
        this.etatCompet = EtatCompet.BONNE_REPONSE_SUPER_CASH_AFFICHEE;
        break;
      case EtatCompet.BONNE_REPONSE_SUPER_CASH_AFFICHEE:
        this.etatCompet = EtatCompet.START_QUESTION_SUPER_CASH;
        break;
    }
    this.etatCompetSource.next(this.etatCompet);
    localStorage.setItem(EtatPartieKeys.ETAT_COMPET, this.etatCompet);
  }

  getEtatCompet() {
    const savedEtatCompet = localStorage.getItem(EtatPartieKeys.ETAT_COMPET);
    if (savedEtatCompet) {
      const etatCompet = Object.values(EtatCompet).find((etat) => etat === savedEtatCompet);
      if (etatCompet) {
        this.etatCompet = etatCompet;
      } else {
        this.etatCompet = EtatCompet.START_QUESTION_SUPER_CASH;
      }
    }
    return of(this.etatCompet);
  }

  passerQuestionSuivante() {
    this.indexCurrentQuestion++;
    this.partieStore.setIndexCurrentQuestion(this.indexCurrentQuestion);
    this.indexCurrentQuestionSource.next(this.indexCurrentQuestion);
  }
}
