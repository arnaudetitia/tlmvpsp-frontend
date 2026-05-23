import { Component, HostListener, OnInit, signal } from '@angular/core';
import { DefiService } from '../../services/defi.service';
import { combineLatest, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ChoixThemeComponent } from './choix-theme/choix-theme.component';
import { ThemeDefi } from '../../models/theme-defi.model';
import { CommonModule } from '@angular/common';
import { Defi } from '../../models/defi.model';
import { CodeTouches } from '../../models/enums/code-touches.enum';
import { DefiJoueurComponent } from './defi-joueur/defi-joueur.component';
import { RecapDefiChallenger, RecapQuestion } from './model/recap-defi-challenger.model';
import { DefiChallengerVerifComponent } from './defi-challenger-verif/defi-challenger-verif.component';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { ModeQuestion } from '../../models/mode-question.models';
import { Jingles } from '../../models/jingles.models';
import { PartieStore } from '../../store/partie.store';
import { ScoresStore } from '../../store/scores.store';
import { DefiStore } from '../../store/defi.store';
import { EtatDefi } from '../../models/enums/etat-defi.enum';

@Component({
  selector: 'app-defi-component',
  imports: [
    CommonModule,
    ChoixThemeComponent,
    DefiJoueurComponent,
    DefiChallengerVerifComponent,
    PanneauScoreJoueursComponent,
  ],
  templateUrl: './defi.component.html',
  styleUrls: ['./defi.component.scss'],
})
export class DefiComponent implements OnInit {
  EtatDefi = EtatDefi;
  currentEtatDefi = signal<EtatDefi>(EtatDefi.CHOIX_THEME);

  themesDefi$: Observable<ThemeDefi[]> = of([]);

  defiChallenger: Defi = {} as Defi;
  defiChampion: Defi = {} as Defi;
  isNouveauChampion = false;

  joueursDefi: string[] = [];

  indexCurrentJoueur: number = 0;
  currentJoueur: string = '';

  reponsesChallenger = signal<RecapDefiChallenger>({
    theme: '',
    recapQuestions: [],
  });

  panneauxDefi = signal<PanneauJoueur[]>([]);

  constructor(
    private defiService: DefiService,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
    private defiStore: DefiStore,
  ) {}

  ngOnInit() {
    this.themesDefi$ = this.defiService.getThemesDefi().pipe();
    this.defiStore.etatDefi$
      .pipe(tap((etatDefi) => this.currentEtatDefi.set(etatDefi)))
      .subscribe();
    combineLatest([
      this.scoresStore.getPanneauxJoueurs(),
      this.defiService.getChampion(),
      this.partieStore.getIndexCurrentJoueurDefi(),
    ])
      .pipe(
        tap(([panneauChallenger, champion, indexCurrentJoueurDefi]) => {
          const panneauChall = panneauChallenger[0];
          this.panneauxDefi.set([
            {
              joueur: panneauChall.joueur,
              score: 0,
              statut: StatutJoueur.CHALLENGER,
              reponseJoueur: '',
            },
            {
              joueur: champion,
              score: 0,
              statut: StatutJoueur.CHAMPION,
            },
          ]);
          this.scoresStore.setPanneauJoueurs(this.panneauxDefi());
          this.joueursDefi = [panneauChall.joueur, champion];
          this.indexCurrentJoueur = indexCurrentJoueurDefi;
          this.currentJoueur = this.joueursDefi[this.indexCurrentJoueur];
        }),
      )
      .subscribe();
    combineLatest([this.partieStore.getIdThemeChallenger(), this.partieStore.getIdThemeChampion()])
      .pipe(
        switchMap(([idThemeChallenger, idThemeChampion]) => {
          return forkJoin([
            this.defiService.getDefiTheme(idThemeChallenger),
            this.defiService.getDefiTheme(idThemeChampion),
          ]);
        }),
        tap(([defiChallenger, defiChampion]) => {
          this.defiChallenger = defiChallenger;
          this.defiChampion = defiChampion;
        }),
      )
      .subscribe();
    this.scoresStore.panneauxJoueurs$
      .pipe(
        tap((panneauJoueurs) => {
          this.panneauxDefi.set(panneauJoueurs);
        }),
      )
      .subscribe();
  }

  getDefiChallenger($event: any) {
    this.partieStore.setIdThemeChallenger($event);
    this.defiService
      .getDefiTheme($event)
      .pipe(
        tap((defi) => {
          this.defiChallenger = defi;
          this.reponsesChallenger.update((current) => ({
            ...current,
            theme: this.defiChallenger.libelleTheme,
          }));
        }),
      )
      .subscribe();
  }

  getDefiChampion($event: any) {
    this.partieStore.setIdThemeChampion($event);
    this.defiService
      .getDefiTheme($event)
      .pipe(
        tap((defi) => {
          this.defiChampion = defi;
        }),
      )
      .subscribe();
  }

  recordQuestion($event: RecapQuestion) {
    this.reponsesChallenger.update((current) => ({
      ...current,
      recapQuestions: [...current.recapQuestions, $event],
    }));
    this.partieStore.setRecapDefiChallenger(this.reponsesChallenger().recapQuestions);
  }

  switchToDefiChampion() {
    this.defiStore.passerEtatSuivant();
    this.indexCurrentJoueur = 1;
    this.partieStore.setIndexCurrentJoueurDefi(this.indexCurrentJoueur);
    this.partieStore.resetIndexCurrentQuestion();
    this.currentJoueur = this.joueursDefi[this.indexCurrentJoueur];
  }

  switchToDefiVerifChallenger() {
    this.defiStore.passerEtatSuivant();
    this.indexCurrentJoueur = 0;
    this.partieStore.setIndexCurrentJoueurDefi(this.indexCurrentJoueur);
    this.partieStore.resetIndexCurrentQuestion();
    this.currentJoueur = this.joueursDefi[this.indexCurrentJoueur];
  }

  augmenterScore(modeQuestion: ModeQuestion | null, statutjoueur: string) {
    if (modeQuestion !== null) {
      this.panneauxDefi.set(
        this.panneauxDefi().map((panneau) => {
          if (panneau.statut === statutjoueur) {
            return {
              ...panneau,
              score: panneau.score + this.getIncrementScore(modeQuestion),
            };
          }
          return panneau;
        }),
      );
      this.scoresStore.setPanneauJoueurs(this.panneauxDefi());
    }
  }

  getIncrementScore(modeQuestion: ModeQuestion) {
    switch (modeQuestion) {
      case ModeQuestion.Duo:
        return 1;
      case ModeQuestion.Carre:
        return 3;
      case ModeQuestion.Cash:
        return 5;
      default:
        return 0;
    }
  }

  declarerChampion() {
    const scoreChampion = this.panneauxDefi().find(
      (panneau) => panneau.statut === StatutJoueur.CHAMPION,
    )?.score;
    const scoreChallenger = this.panneauxDefi().find(
      (panneau) => panneau.statut === StatutJoueur.CHALLENGER,
    )?.score;
    if (scoreChampion && scoreChallenger) {
      if (scoreChampion >= scoreChallenger) {
        Jingles.sonVictoireChampion.play();
      } else {
        this.isNouveauChampion = true;
        Jingles.sonNouveauChampion.play();
        this.defiService.setNouveauChampion(this.joueursDefi[0]).subscribe();
      }
    }
    this.defiStore.passerEtatSuivant();
    localStorage.clear();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent($event: KeyboardEvent) {
    if ($event.code === CodeTouches.rightArrowCode) {
      if (this.currentEtatDefi() === EtatDefi.CHOIX_THEME && this.defiChallenger) {
        this.defiStore.passerEtatSuivant();
      }
    }
  }
}
