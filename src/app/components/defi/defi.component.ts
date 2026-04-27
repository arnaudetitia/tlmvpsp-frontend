import { Component, HostListener, OnInit } from '@angular/core';
import { DefiService } from '../../services/defi.service';
import { combineLatest, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ChoixThemeComponent } from './choix-theme/choix-theme.component';
import { ThemeDefi } from '../../models/theme-defi.model';
import { CommonModule } from '@angular/common';
import { Defi } from '../../models/defi.model';
import { CodeTouches } from '../../models/code-touches.enum';
import { DefiJoueurComponent } from './defi-joueur/defi-joueur.component';
import { RecapDefiChallenger, RecapQuestion } from './model/recap-defi-challenger.model';
import { DefiChallengerVerifComponent } from './defi-challenger-verif/defi-challenger-verif.component';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { ModeQuestion } from '../../models/mode-question.models';
import { Jingles } from '../../models/jingles.models';
import { PartieStore } from '../../store/partie.store';
import { ScoresStore } from '../../store/scores.store';

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
  themesDefi$: Observable<ThemeDefi[]> = of([]);
  showChoixTheme: boolean = true;
  showDefiChallenger: boolean = false;
  showDefiChampion: boolean = false;
  showVerifChallenger: boolean = false;
  showResultatFinal: boolean = false;

  defiChallenger: Defi | undefined;
  defiChampion: Defi | undefined;
  isNouveauChampion = false;

  joueursDefi: string[] = [];

  indexCurrentJoueur: number = 0;
  currentJoueur: string = '';

  reponsesChallenger: RecapDefiChallenger = {
    theme: '',
    recapQuestions: [],
  };

  panneauxDefi: PanneauJoueur[] = [];

  constructor(
    private defiService: DefiService,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
  ) {}

  ngOnInit() {
    this.themesDefi$ = this.defiService.getThemesDefi().pipe();
    combineLatest([
      this.scoresStore.getPanneauxJoueurs(),
      this.defiService.getChampion(),
      this.partieStore.getIndexCurrentJoueurDefi(),
    ])
      .pipe(
        tap(([panneauChallenger, champion, indexCurrentJoueurDefi]) => {
          this.panneauxDefi = [
            { ...panneauChallenger[0], statut: StatutJoueur.CHALLENGER },
            {
              joueur: champion,
              score: 0,
              statut: StatutJoueur.CHAMPION,
            },
          ];
          this.scoresStore.setPanneauJoueurs(this.panneauxDefi);
          this.joueursDefi = [panneauChallenger[0].joueur, champion];
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
  }

  getDefiChallenger($event: any) {
    this.partieStore.setIdThemeChallenger($event);
    this.defiService
      .getDefiTheme($event)
      .pipe(
        tap((defi) => {
          this.defiChallenger = defi;
          this.reponsesChallenger.theme = this.defiChallenger.libelleTheme;
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
    this.reponsesChallenger.recapQuestions.push($event);
    this.partieStore.setRecapDefiChallenger(this.reponsesChallenger.recapQuestions);
  }

  switchToDefiChampion() {
    this.showDefiChallenger = false;
    this.showDefiChampion = true;
    this.indexCurrentJoueur = 1;
    this.partieStore.setIndexCurrentJoueurDefi(this.indexCurrentJoueur);
    this.partieStore.resetIndexCurrentQuestion();
    this.currentJoueur = this.joueursDefi[this.indexCurrentJoueur];
  }

  switchToDefiVerifChallenger() {
    this.showDefiChampion = false;
    this.showVerifChallenger = true;
    this.indexCurrentJoueur = 0;
    this.partieStore.setIndexCurrentJoueurDefi(this.indexCurrentJoueur);
    this.partieStore.resetIndexCurrentQuestion();
    this.currentJoueur = this.joueursDefi[this.indexCurrentJoueur];
  }

  augmenterScore(modeQuestion: ModeQuestion | null, statutjoueur: string) {
    if (modeQuestion !== null) {
      this.panneauxDefi = this.panneauxDefi.map((panneau) => {
        if (panneau.statut === statutjoueur) {
          return {
            ...panneau,
            score: panneau.score + this.getIncrementScore(modeQuestion),
          };
        }
        return panneau;
      });
      this.scoresStore.setPanneauJoueurs(this.panneauxDefi);
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
    const scoreChampion = this.panneauxDefi.find(
      (panneau) => panneau.statut === StatutJoueur.CHAMPION,
    )?.score;
    const scoreChallenger = this.panneauxDefi.find(
      (panneau) => panneau.statut === StatutJoueur.CHALLENGER,
    )?.score;
    if (scoreChampion && scoreChallenger) {
      if (scoreChampion >= scoreChallenger) {
        Jingles.sonVictoireChampion.play();
      } else {
        this.isNouveauChampion = true;
        Jingles.sonNouveauChampion.play();
      }
    }
    this.showVerifChallenger = false;
    this.showResultatFinal = true;
    localStorage.clear();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent($event: KeyboardEvent) {
    if ($event.code === CodeTouches.rightArrowCode) {
      if (this.showChoixTheme && this.defiChallenger) {
        this.showChoixTheme = false;
        this.showDefiChallenger = true;
      }
    }
  }
}
