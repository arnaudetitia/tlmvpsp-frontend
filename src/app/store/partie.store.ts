import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EtatPartieKeys } from '../models/enums/etat-partie.enum';
import { RecapQuestion } from '../components/defi/model/recap-defi-challenger.model';

@Injectable({ providedIn: 'root' })
export class PartieStore {
  indexCurrentQuestion: number = 0;

  ordreJoueursSuperCash: string[] = [];
  indexJoueurSuperCash: number = 0;
  initialAlreadyPlayedQuestionMap = new Map([
    [8, false],
    [9, false],
    [10, false],
    [11, false],
  ]);
  alreadyPlayedQuestionsMap: Map<number, boolean> = new Map();

  idThemeChallenger: number = 0;
  idThemeChampion: number = 0;
  indexCurrentJoueurDefi: number = 0;

  recapDefiChallenger: RecapQuestion[] = [];

  indexCurrentQuestionSource = new BehaviorSubject<number>(0);
  indexCurrentQuestion$ = this.indexCurrentQuestionSource.asObservable();

  ordreJoueursSuperCashSource = new BehaviorSubject<string[]>([]);
  ordreJoueursSuperCash$ = this.ordreJoueursSuperCashSource.asObservable();

  indexJoueurSuperCashSource = new BehaviorSubject<number>(0);
  indexJoueurSuperCash$ = this.indexJoueurSuperCashSource.asObservable();

  alreadyPlayedQuestionsMapSource = new BehaviorSubject<Map<number, boolean>>(
    this.initialAlreadyPlayedQuestionMap,
  );
  alreadyPlayedQuestionsMap$ = this.alreadyPlayedQuestionsMapSource.asObservable();

  idThemeChallengerSource = new BehaviorSubject<number>(0);
  idThemeChallenger$ = this.idThemeChallengerSource.asObservable();

  idThemeChampionSource = new BehaviorSubject<number>(0);
  idThemeChampion$ = this.idThemeChampionSource.asObservable();

  indexCurrentJoueurDefiSource = new BehaviorSubject<number>(0);
  indexCurrentJoueurDefi$ = this.indexCurrentJoueurDefiSource.asObservable();

  recapDefiChallengerSource = new BehaviorSubject<RecapQuestion[]>([]);
  recapDefiChallenger$ = this.recapDefiChallengerSource.asObservable();

  setIndexCurrentQuestion(indexQuestion: number) {
    this.indexCurrentQuestion = indexQuestion;
    this.indexCurrentQuestionSource.next(indexQuestion);
    localStorage.setItem(EtatPartieKeys.QUESTION_EN_COURS, indexQuestion.toString());
  }

  getIndexCurrentQuestion() {
    const savedInexCurrentQuestion = localStorage.getItem(EtatPartieKeys.QUESTION_EN_COURS);
    if (savedInexCurrentQuestion) {
      this.indexCurrentQuestion = Number.parseInt(savedInexCurrentQuestion);
    }
    return of(this.indexCurrentQuestion);
  }

  resetIndexCurrentQuestion() {
    this.indexCurrentQuestion = 0;
    this.indexCurrentQuestionSource.next(0);
    localStorage.setItem(EtatPartieKeys.QUESTION_EN_COURS, '0');
  }

  setOrdreJoueursSuperCash(ordreJoueurs: string[]) {
    this.ordreJoueursSuperCash = ordreJoueurs;
    this.ordreJoueursSuperCashSource.next(this.ordreJoueursSuperCash);
    localStorage.setItem(
      EtatPartieKeys.ORDRE_JOUEURS_SUPER_CASH,
      JSON.stringify(this.ordreJoueursSuperCash),
    );
  }

  getOrdreJoueursSuperCash() {
    if (!this.ordreJoueursSuperCash.length) {
      const savedOrdreJoueursSuperCash = localStorage.getItem(
        EtatPartieKeys.ORDRE_JOUEURS_SUPER_CASH,
      );
      if (savedOrdreJoueursSuperCash) {
        this.ordreJoueursSuperCash = JSON.parse(savedOrdreJoueursSuperCash);
      }
    }
    return of(this.ordreJoueursSuperCash);
  }

  setAlreadyPlayedQuestions(alreadyPlayed: Map<number, boolean>) {
    this.alreadyPlayedQuestionsMap = alreadyPlayed;
    this.alreadyPlayedQuestionsMapSource.next(this.alreadyPlayedQuestionsMap);
    localStorage.setItem(
      EtatPartieKeys.SUPER_CASH_ALREADY_PLAYED,
      JSON.stringify(Array.from(this.alreadyPlayedQuestionsMap)),
    );
  }

  getAlreadyPlayedQuestions() {
    if (!this.alreadyPlayedQuestionsMap.size) {
      const savedalreadyPlayedQuestionsMap = localStorage.getItem(
        EtatPartieKeys.SUPER_CASH_ALREADY_PLAYED,
      );
      if (savedalreadyPlayedQuestionsMap) {
        this.alreadyPlayedQuestionsMap = new Map(JSON.parse(savedalreadyPlayedQuestionsMap));
      } else {
        this.alreadyPlayedQuestionsMap = this.initialAlreadyPlayedQuestionMap;
      }
    }
    return of(this.alreadyPlayedQuestionsMap);
  }

  setIndexJoueurSuperCash(indexJoueurSuperCash: number) {
    this.indexJoueurSuperCash = indexJoueurSuperCash;
    this.indexJoueurSuperCashSource.next(this.indexJoueurSuperCash);
    localStorage.setItem(EtatPartieKeys.INDEX_JOUEUR_SUPER_CASH, indexJoueurSuperCash.toString());
  }

  getIndexJoueurSuperCash(): Observable<number> {
    if (!this.indexJoueurSuperCash) {
      const savedIndexJoueurSuperCash = localStorage.getItem(
        EtatPartieKeys.INDEX_JOUEUR_SUPER_CASH,
      );
      if (savedIndexJoueurSuperCash) {
        this.indexJoueurSuperCash = Number.parseInt(savedIndexJoueurSuperCash);
      }
    }
    return of(this.indexJoueurSuperCash);
  }

  setIdThemeChallenger(idTheme: number) {
    this.idThemeChallenger = idTheme;
    this.idThemeChallengerSource.next(idTheme);
    localStorage.setItem(EtatPartieKeys.ID_THEME_CHALLENGER, idTheme.toString());
  }

  getIdThemeChallenger(): Observable<number> {
    if (!this.idThemeChallenger) {
      const savedIdThemeChallenger = localStorage.getItem(EtatPartieKeys.ID_THEME_CHALLENGER);
      if (savedIdThemeChallenger) {
        this.idThemeChallenger = Number.parseInt(savedIdThemeChallenger);
      }
    }
    return of(this.idThemeChallenger);
  }

  setIdThemeChampion(idTheme: number) {
    this.idThemeChampion = idTheme;
    this.idThemeChampionSource.next(idTheme);
    localStorage.setItem(EtatPartieKeys.ID_THEME_CHAMPION, idTheme.toString());
  }

  getIdThemeChampion(): Observable<number> {
    if (!this.idThemeChampion) {
      const savedIdThemeChampion = localStorage.getItem(EtatPartieKeys.ID_THEME_CHAMPION);
      if (savedIdThemeChampion) {
        this.idThemeChampion = Number.parseInt(savedIdThemeChampion);
      }
    }
    return of(this.idThemeChampion);
  }

  setIndexCurrentJoueurDefi(indexCurrentJoueurDefi: number) {
    this.indexCurrentJoueurDefi = indexCurrentJoueurDefi;
    this.indexCurrentJoueurDefiSource.next(this.indexCurrentJoueurDefi);
    localStorage.setItem(
      EtatPartieKeys.INDEX_CURRENT_JOUEUR_DEFI,
      indexCurrentJoueurDefi.toString(),
    );
  }

  getIndexCurrentJoueurDefi(): Observable<number> {
    if (!this.indexCurrentJoueurDefi) {
      const savedIndexCurrentJoueurDefi = localStorage.getItem(
        EtatPartieKeys.INDEX_CURRENT_JOUEUR_DEFI,
      );
      if (savedIndexCurrentJoueurDefi) {
        this.indexCurrentJoueurDefi = Number.parseInt(savedIndexCurrentJoueurDefi);
      }
    }
    return of(this.indexCurrentJoueurDefi);
  }

  setRecapDefiChallenger(recapQuestions: RecapQuestion[]) {
    this.recapDefiChallenger = recapQuestions;
    this.recapDefiChallengerSource.next(this.recapDefiChallenger);
    localStorage.setItem(
      EtatPartieKeys.RECAP_DEFI_CHALLENGER,
      JSON.stringify(this.recapDefiChallenger),
    );
  }

  getRecapDefiChallenger(): Observable<RecapQuestion[]> {
    if (!this.recapDefiChallenger.length) {
      const savedRecapDefiChallenger = localStorage.getItem(EtatPartieKeys.RECAP_DEFI_CHALLENGER);
      if (savedRecapDefiChallenger) {
        this.recapDefiChallenger = JSON.parse(savedRecapDefiChallenger);
      }
    }
    return of(this.recapDefiChallenger);
  }
}
