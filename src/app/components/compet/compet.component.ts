import { ChangeDetectorRef, Component, HostListener, OnInit, signal } from '@angular/core';
import { CompetService } from '../../services/compet.service';
import { combineLatest, filter, map, merge, Observable, of, switchMap, tap } from 'rxjs';
import { ChampReponseComponent } from '../../shared/champ-reponse/champ-reponse.component';
import { TypeChamp } from '../../shared/champ-reponse/type-champ.enum';
import { CommonModule } from '@angular/common';
import { Compet, QuestionCompet } from '../../models/compet.model';
import { ModeQuestion } from '../../models/mode-question.models';
import { ChoixSuperCashComponent } from './choix-super-cash/choix-super-cash.component';
import { CodeTouches } from '../../models/enums/code-touches.enum';
import { Jingles } from '../../models/jingles.models';
import { JoueursStore } from '../../store/joueurs.store';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ScoresStore } from '../../store/scores.store';
import { PartieStore } from '../../store/partie.store';
import { SortAndMixReponsesUtils } from '../../utils/sort-and-mix-reponses.util';
import { ChampQuestionComponent } from '../../shared/champ-question/champ-question.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { ManchesEnum } from '../../models/enums/manches.enum';
import { CompetStore } from '../../store/compet.store';
import { EtatCompet } from '../../models/enums/etat-compet.enum';

@Component({
  selector: 'app-compet',
  imports: [
    CommonModule,
    ChoixSuperCashComponent,
    ChampQuestionComponent,
    ChampReponseComponent,
    PanneauScoreJoueursComponent,
    MatGridListModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './compet.component.html',
  styleUrls: ['./compet.component.scss'],
})
export class CompetComponent implements OnInit {
  mancheCompet = ManchesEnum.COMPET;
  typeChampCompet = TypeChamp.COMPET;

  compet$: Observable<any> = of(null);
  compet: Compet | null = null;
  theme: string = '';

  currentCompetState: EtatCompet = EtatCompet.START_QUESTION_NORMALE;

  questionList: QuestionCompet[] = [];
  currentQuestion: QuestionCompet = {} as QuestionCompet;
  isChronoLong: boolean = false;

  reponsesDisplay: string[] = [];

  TypeChamp = TypeChamp;
  EtatCompet = EtatCompet;

  scoresCompet: PanneauJoueur[] = [];
  joueursAvecBonneReponse: string[] = [];

  calculSuperCashDone: boolean = false;
  ordreJoueurSuperCash: string[] = [];
  indexJoueurSuperCash: number = 0;
  selectedJoueurSuperCash: string = '';

  selectedQuestion = new Map([
    [8, false],
    [9, false],
    [10, false],
    [11, false],
  ]);

  alreadyPlayed = new Map<number, boolean>();

  competTermmine = false;

  constructor(
    private competService: CompetService,
    private joueursStore: JoueursStore,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
    private competStore: CompetStore,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    merge(this.scoresStore.panneauxJoueurs$, this.scoresStore.getPanneauxJoueurs())
      .pipe(
        tap((panneauJoueurs) => {
          this.scoresCompet = panneauJoueurs;
        }),
      )
      .subscribe();
    this.competStore.etatCompet$
      .pipe(
        tap((etatCompet) => {
          this.currentCompetState = etatCompet;
          switch (this.currentCompetState) {
            case EtatCompet.START_QUESTION_NORMALE:
              this.competService.closeVotes().subscribe();
              break;
            case EtatCompet.VOTES_OUVERTS:
              this.competService.openVotes().subscribe();
              if (this.isChronoLong) {
                Jingles.sonChronoCompetLong.play();
              } else {
                Jingles.sonChronoCompet.play();
              }
              break;

            case EtatCompet.VOTES_FERMES:
              this.competService.freezeVotes().subscribe();
              this.cdr.detectChanges();
              break;

            case EtatCompet.BONNE_REPONSE_AFFICHEE:
              Jingles.sonBonneReponse.play();
              break;

            case EtatCompet.START_QUESTION_SUPER_CASH:
              if (!this.calculSuperCashDone) {
                this.competService.closeVotes().subscribe();
                this.calculSuperCashDone = true;
                this.calulerOrdreCandidats();
              } else {
                this.indexJoueurSuperCash++;
              }
              this.selectedJoueurSuperCash = this.ordreJoueurSuperCash[this.indexJoueurSuperCash];
              break;

            case EtatCompet.CHRONO_SUPER_CASH_LANCE:
              Jingles.sonChronoCompet.play();
              break;
          }
        }),
      )
      .subscribe();
    this.compet$ = combineLatest([
      this.competService.getCompet(),
      this.partieStore.getIndexCurrentQuestion(),
      this.partieStore.getAlreadyPlayedQuestions(),
      this.partieStore.getOrdreJoueursSuperCash(),
      this.partieStore.getIndexJoueurSuperCash(),
      this.competStore.getEtatCompet(),
    ]).pipe(
      tap(
        ([
          compet,
          indexCurrentQuestion,
          alreadyPlayedQuestionsMap,
          ordreJoueursSuperCash,
          indexJoueurSuperCash,
          etatCompet,
        ]) => {
          this.currentCompetState = etatCompet;
          this.compet = compet;
          this.theme = compet.libelleTheme;
          this.questionList = compet.questionsCompet.map((question) => {
            let modeQuestion: ModeQuestion;
            switch (question.mauvaisesReponses.length) {
              case 1:
                modeQuestion = ModeQuestion.Duo;
                break;
              case 3:
                modeQuestion = ModeQuestion.Carre;
                break;
              default:
                modeQuestion = ModeQuestion.Cash;
                break;
            }
            return {
              ...question,
              mode: modeQuestion,
            };
          });
          this.competStore.indexCurrentQuestionSource.next(indexCurrentQuestion);
          this.alreadyPlayed = alreadyPlayedQuestionsMap;
          this.ordreJoueurSuperCash = ordreJoueursSuperCash;
          this.indexJoueurSuperCash = indexJoueurSuperCash;
        },
      ),
    );
    this.competStore.indexCurrentQuestion$
      .pipe(
        filter(() => this.questionList.length > 0),
        map((indexQuestion) => {
          this.isChronoLong = [6, 7].includes(indexQuestion);
          this.currentQuestion = this.questionList[indexQuestion];
          this.reponsesDisplay = SortAndMixReponsesUtils.trierReponses(
            [this.currentQuestion.bonneReponse, ...this.currentQuestion.mauvaisesReponses],
            this.currentQuestion.mode,
            this.currentQuestion.tri,
          );
          return {
            question: this.currentQuestion.question,
            reponses: this.reponsesDisplay,
          };
        }),
        filter((currentQuestion) => !!currentQuestion),
        switchMap((currentQuestion) => {
          return this.competService.setQuestionToRemote(
            currentQuestion.question,
            currentQuestion.reponses,
          );
        }),
      )
      .subscribe();

    Jingles.sonChronoCompet.onended = () => {
      this.competStore.passerEtatSuivant();
    };
    Jingles.sonChronoCompetLong.onended = () => {
      this.competStore.passerEtatSuivant();
    };
  }

  calulerOrdreCandidats() {
    const sortedJoueurs = [...this.scoresCompet].sort((scoreA, scoreB) => {
      if (scoreB.score !== scoreA.score) {
        return scoreA.score - scoreB.score;
      }
      const positionA = this.scoresCompet.findIndex((panneau) => panneau.joueur === scoreA.joueur);
      const positionB = this.scoresCompet.findIndex((panneau) => panneau.joueur === scoreB.joueur);
      return positionA - positionB;
    });
    this.ordreJoueurSuperCash = sortedJoueurs.map((panneau) => panneau.joueur);
    this.partieStore.setOrdreJoueursSuperCash(this.ordreJoueurSuperCash);
  }

  preparerSelectedQuestion(idQuestion: number) {
    this.competStore.passerEtatSuivant();
    if (this.currentCompetState === EtatCompet.QUESTION_SUPER_CASH_CHOISIE) {
      this.selectedQuestion.set(idQuestion, true);
      this.alreadyPlayed.set(idQuestion, false);
      this.currentQuestion = this.questionList[idQuestion];
    }
  }

  stopChrono() {
    Jingles.sonChronoCompet.pause();
    Jingles.sonChronoCompet.currentTime = 0;
    this.competStore.passerEtatSuivant();
  }

  resetReponsesJoueurs() {
    this.scoresCompet = this.scoresCompet.map((panneau) => {
      return {
        ...panneau,
        reponseJoueur: '',
      };
    });
    this.joueursAvecBonneReponse = [];
  }

  enregistrerJoueurAvecBonneReponse(nomJoueur: string) {
    this.joueursAvecBonneReponse.push(nomJoueur);
  }

  augmenterScore() {
    const incrementScore = this.getIncrementScore();
    this.joueursAvecBonneReponse.forEach((joueur) => {
      this.modifierScoreJoueur(joueur, incrementScore);
    });
  }

  modifierScoreJoueur(joueur: string, increment: number) {
    this.scoresCompet = this.scoresCompet.map((panneau) => {
      if (panneau.joueur === joueur) {
        return {
          ...panneau,
          score: panneau.score + increment,
        };
      }
      return panneau;
    });
  }

  getIncrementScore() {
    switch (this.currentQuestion?.mode) {
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

  calculerQualification() {
    const sortedJoueurs = [...this.scoresCompet].sort(
      (scoreA, scoreB) => scoreB.score - scoreA.score,
    );

    const scorePremier = sortedJoueurs[0].score;

    this.scoresCompet = this.scoresCompet.map((scoreJoueur) => {
      let statutJoueur: StatutJoueur;
      if (scoreJoueur.score === scorePremier) {
        statutJoueur = StatutJoueur.BALLOTAGE;
      } else {
        statutJoueur = StatutJoueur.ELIMINE;
      }
      return { ...scoreJoueur, statut: statutJoueur };
    });

    const nbJoueursBallotage = this.scoresCompet.filter(
      (scoreJoueur) => scoreJoueur.statut === StatutJoueur.BALLOTAGE,
    ).length;

    if (nbJoueursBallotage === 1) {
      let challenger: string = '';
      this.scoresCompet = this.scoresCompet.map((panneauJoueur) => {
        if (panneauJoueur.statut !== StatutJoueur.BALLOTAGE) {
          return { ...panneauJoueur, statut: StatutJoueur.ELIMINE };
        } else {
          challenger = panneauJoueur.joueur;
          this.competTermmine = true;
          return { ...panneauJoueur, statut: StatutJoueur.QUALIFIE };
        }
      });
      if (this.competTermmine) {
        this.joueursStore.setChallenger(challenger);
        this.partieStore.resetIndexCurrentQuestion();
      }
    }
  }

  setChallenger(nom: string[]) {
    this.competTermmine = true;
    this.joueursStore.setChallenger(nom[0]);
    this.partieStore.resetIndexCurrentQuestion();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (
          !this.currentCompetState.includes('BONNE_REPONSE') &&
          ![
            EtatCompet.VOTES_OUVERTS,
            EtatCompet.START_QUESTION_SUPER_CASH,
            EtatCompet.REPONSE_SUPER_CASH_DONNEE,
          ].includes(this.currentCompetState)
        ) {
          this.competStore.passerEtatSuivant();
        }
        break;
      case CodeTouches.rightArrowCode:
        if (this.currentCompetState.includes('BONNE_REPONSE')) {
          switch (this.currentCompetState) {
            case EtatCompet.BONNE_REPONSE_AFFICHEE:
              this.augmenterScore();
              this.resetReponsesJoueurs();
              break;

            case EtatCompet.BONNE_REPONSE_SUPER_CASH_AFFICHEE:
              [...this.alreadyPlayed.keys()].forEach((idQuestion) => {
                if (this.selectedQuestion.get(idQuestion)) {
                  this.alreadyPlayed.set(idQuestion, true);
                }

                this.selectedQuestion.set(idQuestion, false);
                if (Array.from(this.alreadyPlayed.values()).every((jouee) => jouee === true)) {
                  this.calculerQualification();
                }
              });
              break;
          }
          this.competStore.passerEtatSuivant();
        }
        break;
      case CodeTouches.buttonTCode:
        if (this.currentCompetState === EtatCompet.REPONSE_SUPER_CASH_DONNEE) {
          this.competStore.passerEtatSuivant();
          this.modifierScoreJoueur(this.selectedJoueurSuperCash, 5);
          Jingles.sonBonneReponse.play();
        }
        break;
      case CodeTouches.buttonFCode:
        if (this.currentCompetState === EtatCompet.REPONSE_SUPER_CASH_DONNEE) {
          this.competStore.passerEtatSuivant();
          this.modifierScoreJoueur(this.selectedJoueurSuperCash, -5);
          Jingles.sonMauvaiseReponse.play();
        }
        break;
      case CodeTouches.buttonSCode:
        if (this.currentCompetState === EtatCompet.CHRONO_SUPER_CASH_LANCE) {
          this.stopChrono();
          Jingles.sonFinChronoCompet.play();
        }
        break;
    }
  }
}
