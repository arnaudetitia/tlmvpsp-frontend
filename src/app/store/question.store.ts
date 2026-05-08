import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { EtatQuestion } from '../models/etat-question.enum';
import { EtatPartieKeys } from '../models/etat-partie.enum';
import { ManchesEnum } from '../models/manches.enum';

@Injectable({
  providedIn: 'root',
})
export class QuestionStore {
  etatQuestion: EtatQuestion = EtatQuestion.START_QUESTION;

  etatQuestionSource = new BehaviorSubject<EtatQuestion>(EtatQuestion.START_QUESTION);
  etatQuestion$ = this.etatQuestionSource.asObservable();

  passerEtatSuivant(manche: ManchesEnum, superCash: boolean = false) {
    switch (this.etatQuestion) {
      case EtatQuestion.START_QUESTION:
        this.etatQuestion = EtatQuestion.QUESTION_POSE;
        break;
      case EtatQuestion.QUESTION_POSE:
        this.etatQuestion = EtatQuestion.CHOIX_MODE_QUESTION;
        break;
      case EtatQuestion.CHOIX_MODE_QUESTION:
        this.etatQuestion = EtatQuestion.REPONSES_PROPOSEES;
        break;
      case EtatQuestion.REPONSES_PROPOSEES:
        this.etatQuestion = EtatQuestion.REPONSE_JOUEUR_DONNEE;
        break;
      case EtatQuestion.REPONSE_JOUEUR_DONNEE:
        this.etatQuestion =
          manche === ManchesEnum.DEFI_CHALLENGER
            ? EtatQuestion.START_QUESTION
            : EtatQuestion.BONNE_REPONSE_AFFICHEE;
        break;
      case EtatQuestion.BONNE_REPONSE_AFFICHEE:
        this.etatQuestion = EtatQuestion.START_QUESTION;
        break;
    }

    this.etatQuestionSource.next(this.etatQuestion);
    localStorage.setItem(EtatPartieKeys.ETAT_QUESTION, this.etatQuestion);
  }

  getEtatQuestion() {
    const savedEtatQuestion = localStorage.getItem(EtatPartieKeys.ETAT_QUESTION);
    if (savedEtatQuestion) {
      const etatQuestion = Object.values(EtatQuestion).find((etat) => etat === savedEtatQuestion);
      if (etatQuestion) {
        this.etatQuestion = etatQuestion;
      } else {
        this.etatQuestion = EtatQuestion.START_QUESTION;
      }
    }
    return of(this.etatQuestion);
  }

  resetEtatQuestion() {
    this.etatQuestion = EtatQuestion.START_QUESTION;
    this.etatQuestionSource.next(this.etatQuestion);
    localStorage.setItem(EtatPartieKeys.ETAT_QUESTION, this.etatQuestion);
  }
}
