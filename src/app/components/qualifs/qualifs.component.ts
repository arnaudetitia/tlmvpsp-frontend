import { ChangeDetectorRef, Component, Host, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualifsService } from '../../services/qualifs.service';
import { combineLatest, tap } from 'rxjs';
import { ModeQuestion, valeurModeQuestion } from '../../models/mode-question.models';
import { QuestionQualif } from '../../models/qualifs.models';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { JoueursStore } from '../../store/joueurs.store';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CompetService } from '../../services/compet.service';
import { ScoresStore } from '../../store/scores.store';
import { PartieStore } from '../../store/partie.store';
import { ManchesEnum } from '../../models/enums/manches.enum';
import { ChampQuestionComponent } from '../../shared/champ-question/champ-question.component';
import { Jingles } from '../../models/jingles.models';
import { SortAndMixReponsesUtils } from '../../utils/sort-and-mix-reponses.util';
import { EtatQuestion } from '../../models/enums/etat-question.enum';
import { QuestionStore } from '../../store/question.store';
import { CodeTouches } from '../../models/enums/code-touches.enum';
import { ChampReponseComponent } from '../../shared/champ-reponse/champ-reponse.component';
import { ChoixModeComponent } from '../../shared/choix-mode/choix-mode.compoent';
import { MatGridListModule } from '@angular/material/grid-list';
import { EtatPartieKeys } from '../../models/enums/etat-partie.enum';

@Component({
  selector: 'app-qualifs',
  imports: [
    CommonModule,
    ChampQuestionComponent,
    ChoixModeComponent,
    ChampReponseComponent,
    PanneauScoreJoueursComponent,
    MatGridListModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './qualifs.component.html',
  styleUrls: ['./qualifs.component.scss'],
})
export class QualifsComponent implements OnInit {
  mancheQualif = ManchesEnum.QUALIFS;
  currentQuestionState: EtatQuestion = EtatQuestion.START_QUESTION;
  modeQuestionSelected: ModeQuestion = {} as ModeQuestion;
  indexJoueur = 0;

  questionsQualifs: QuestionQualif[] = [];
  questionIndex = 0;
  currentQuestion: QuestionQualif = {} as QuestionQualif;

  reponsesDisplay: string[] = [];
  reponseDonnee: string = '';

  qualifsTerminees: boolean = false;

  scoresQualifs: PanneauJoueur[] = [];

  EtatQuestion = EtatQuestion;
  ModeQuestion = ModeQuestion;

  constructor(
    private qualifsService: QualifsService,
    private joueursStore: JoueursStore,
    private competService: CompetService,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
    private questionStore: QuestionStore,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.scoresStore
      .getPanneauxJoueurs()
      .pipe(
        tap((scores) => {
          this.scoresQualifs = scores;
        }),
      )
      .subscribe();
    this.questionStore.etatQuestion$
      .pipe(
        tap((etat) => {
          this.currentQuestionState = etat;
          if (
            this.currentQuestionState === EtatQuestion.BONNE_REPONSE_AFFICHEE &&
            this.modeQuestionSelected !== ModeQuestion.Cash
          ) {
            if (this.reponseDonnee === this.currentQuestion.bonneReponse) {
              Jingles.sonBonneReponse.play();
              this.incrementerScoreJoueur(this.modeQuestionSelected);
            } else {
              Jingles.sonMauvaiseReponse.play();
            }
          }
        }),
      )
      .subscribe();
    combineLatest([
      this.qualifsService.getQuestionsQualifs(),
      this.partieStore.getIndexCurrentQuestion(),
    ])
      .pipe(
        tap(([questions, questionIndex]) => {
          this.questionsQualifs = questions;
          this.questionIndex = questionIndex;
          this.currentQuestion = this.questionsQualifs[this.questionIndex];
          this.indexJoueur = Math.floor(this.questionIndex / 2);
          this.reponsesDisplay = [
            this.currentQuestion.bonneReponse,
            ...this.currentQuestion.mauvaisesReponses,
          ];
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  onModeSelected(mode: ModeQuestion) {
    this.modeQuestionSelected = mode;
    this.reponsesDisplay = SortAndMixReponsesUtils.trierReponses(
      this.reponsesDisplay,
      this.modeQuestionSelected,
      this.currentQuestion?.tri,
    );
    this.questionStore.passerEtatSuivant(this.mancheQualif);
    Jingles.sonChronoQualif.play();
  }

  onReponseSelected(reponse: string) {
    this.reponseDonnee = reponse;
    this.stopChrono();
    this.questionStore.passerEtatSuivant(this.mancheQualif);
  }

  stopChrono() {
    Jingles.sonChronoQualif.pause();
    Jingles.sonChronoQualif.currentTime = 0;
  }

  preparerSuite() {
    if (this.questionIndex === this.questionsQualifs.length - 1) {
      this.calculerQualification();
    } else {
      this.prepareNextQuestion();
    }
  }

  prepareNextQuestion() {
    this.questionIndex++;
    this.partieStore.setIndexCurrentQuestion(this.questionIndex);
    this.indexJoueur = Math.floor(this.questionIndex / 2);
    this.currentQuestion = this.questionsQualifs[this.questionIndex];
    this.reponsesDisplay = [
      this.currentQuestion.bonneReponse,
      ...this.currentQuestion.mauvaisesReponses,
    ];
  }

  calculerQualification() {
    const sortedJoueurs = [...this.scoresQualifs].sort(
      (scoreA, scoreB) => scoreB.score - scoreA.score,
    );

    const scoreCinquiemme = sortedJoueurs[4].score;

    this.scoresQualifs = this.scoresQualifs.map((scoreJoueur) => {
      let statutJoueur: StatutJoueur;

      if (scoreJoueur.score > scoreCinquiemme) {
        statutJoueur = StatutJoueur.QUALIFIE;
      } else if (scoreJoueur.score < scoreCinquiemme) {
        statutJoueur = StatutJoueur.ELIMINE;
      } else {
        statutJoueur = StatutJoueur.BALLOTAGE;
      }
      return { ...scoreJoueur, statut: statutJoueur };
    });

    const nbJoueursQualifie = this.scoresQualifs.filter(
      (scoreJoueur) => scoreJoueur.statut === StatutJoueur.QUALIFIE,
    ).length;

    if (nbJoueursQualifie === 4) {
      let joueursQualifies: string[] = [];
      this.scoresQualifs = this.scoresQualifs.map((scoreJoueur) => {
        if (scoreJoueur.statut !== StatutJoueur.QUALIFIE) {
          return { ...scoreJoueur, statut: StatutJoueur.ELIMINE };
        } else {
          joueursQualifies.push(scoreJoueur.joueur);
        }
        return scoreJoueur;
      });
      this.qualifierJoueur(joueursQualifies);
      this.competService.setJoueursCompet(joueursQualifies).subscribe();
      this.scoresStore.initScores(joueursQualifies);
      this.qualifsTerminees = true;
    }
  }

  qualifierJoueur(joueurs: string[]) {
    this.joueursStore.setQualifiesCompet(joueurs);
    this.competService.setJoueursCompet(joueurs).subscribe();
    this.scoresStore.initScores(joueurs);
    this.partieStore.resetIndexCurrentQuestion();
    this.qualifsTerminees = true;
    this.questionStore.resetEtatQuestion();
  }

  incrementerScoreJoueur(modeQuestion: ModeQuestion) {
    this.scoresQualifs[this.indexJoueur].score += valeurModeQuestion[modeQuestion];
    this.scoresStore.setPanneauJoueurs(this.scoresQualifs);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (
          ![
            EtatQuestion.CHOIX_MODE_QUESTION,
            EtatQuestion.REPONSES_PROPOSEES,
            EtatQuestion.BONNE_REPONSE_AFFICHEE,
          ].includes(this.currentQuestionState)
        ) {
          if (
            this.currentQuestionState !== EtatQuestion.REPONSE_JOUEUR_DONNEE ||
            this.modeQuestionSelected !== ModeQuestion.Cash
          ) {
            this.questionStore.passerEtatSuivant(this.mancheQualif);
          }
        }
        break;

      case CodeTouches.buttonSCode:
        if (
          this.currentQuestionState === EtatQuestion.REPONSES_PROPOSEES &&
          this.modeQuestionSelected === ModeQuestion.Cash
        ) {
          this.questionStore.passerEtatSuivant(this.mancheQualif);
          Jingles.selectionReponse.play();
          this.stopChrono();
        }
        break;

      case CodeTouches.buttonTCode:
        if (this.currentQuestionState === EtatQuestion.REPONSE_JOUEUR_DONNEE) {
          this.questionStore.passerEtatSuivant(this.mancheQualif);
          Jingles.sonBonneReponse.play();
          this.scoresQualifs[this.indexJoueur].score += 5;
          this.scoresStore.setPanneauJoueurs(this.scoresQualifs);
        }
        break;

      case CodeTouches.buttonFCode:
        if (this.currentQuestionState === EtatQuestion.REPONSE_JOUEUR_DONNEE) {
          this.questionStore.passerEtatSuivant(this.mancheQualif);
          Jingles.sonMauvaiseReponse.play();
        }
        break;

      case CodeTouches.rightArrowCode:
        if (this.currentQuestionState === EtatQuestion.BONNE_REPONSE_AFFICHEE) {
          if (this.questionIndex < this.questionsQualifs.length - 1) {
            this.questionStore.passerEtatSuivant(this.mancheQualif);
            this.prepareNextQuestion();
          } else {
            this.calculerQualification();
          }
        }
        break;

      default:
        break;
    }
  }
}
