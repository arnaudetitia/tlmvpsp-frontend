import { ChangeDetectorRef, Component, Host, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QualifsService } from '../../services/qualifs.service';
import { combineLatest, map, tap } from 'rxjs';
import { ChoixModeComponent } from '../../shared/choix-mode/choix-mode.compoent';
import { ModeQuestion } from '../../models/mode-question.models';
import { ChampReponseComponent } from '../../shared/champ-reponse/champ-reponse.component';
import { QuestionQualif } from '../../models/qualifs.models';
import { CodeTouches } from '../../models/code-touches.enum';
import { Jingles } from '../../models/jingles.models';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { JoueursStore } from '../../store/joueurs.store';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CompetService } from '../../services/compet.service';
import { ScoresStore } from '../../store/scores.store';
import { PartieStore } from '../../store/partie.store';

@Component({
  selector: 'app-qualifs',
  imports: [
    CommonModule,
    ChampReponseComponent,
    ChoixModeComponent,
    PanneauScoreJoueursComponent,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './qualifs.component.html',
  styleUrls: ['./qualifs.component.scss'],
})
export class QualifsComponent implements OnInit {
  indexJoueur = 0;

  questionsQualifs: QuestionQualif[] = [];
  questionIndex = 0;
  currentQuestion: QuestionQualif | null = null;
  reponsesDisplay: string[] = [];
  extraitMusique: HTMLAudioElement | null = null;
  extraitBloque = signal<boolean | null>(null);

  showQuestion: boolean = false;
  showModeSelection: boolean = false;

  modeQuestion = ModeQuestion;
  modeQuestionSelected: ModeQuestion | null = null;

  reponseAlreadySelected: boolean = false;
  isBonneReponseGiven: boolean = false;
  bonneReponseShown: boolean = false;
  bonneReponse: string = '';

  showButtonToCompet: boolean = false;

  scoresQualifs: PanneauJoueur[] = [];

  constructor(
    private qualifsService: QualifsService,
    private joueursStore: JoueursStore,
    private competService: CompetService,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
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
            this.currentQuestion.bonne_reponse,
            ...this.currentQuestion.mauvaises_reponses,
          ];
          this.bonneReponse = this.currentQuestion.bonne_reponse;
          this.extraitMusique = this.currentQuestion.musique
            ? new Audio(`/assets/extraits/${this.currentQuestion.musique}.mp3`)
            : null;
          this.extraitBloque.set(this.currentQuestion.jouee_apres_question);
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  onModeSelected(mode: ModeQuestion) {
    this.modeQuestionSelected = mode;
    this.melangerReponses();
    Jingles.sonChronoQualif.play();
  }

  onReponseSelected(reponse: string) {
    this.reponseAlreadySelected = true;
    this.extraitBloque.set(false);
    this.stopChrono();
    if (reponse === this.bonneReponse) {
      this.isBonneReponseGiven = true;
    }
  }

  stopChrono() {
    Jingles.sonChronoQualif.pause();
    Jingles.sonChronoQualif.currentTime = 0;
  }

  prepareNextQuestion() {
    this.modeQuestionSelected = null;
    this.showQuestion = false;
    this.showModeSelection = false;
    this.reponseAlreadySelected = false;
    this.isBonneReponseGiven = false;
    this.bonneReponseShown = false;
    this.questionIndex++;
    this.partieStore.setIndexCurrentQuestion(this.questionIndex);
    this.indexJoueur = Math.floor(this.questionIndex / 2);
    this.currentQuestion = this.questionsQualifs[this.questionIndex];
    this.reponsesDisplay = [
      this.currentQuestion.bonne_reponse,
      ...this.currentQuestion.mauvaises_reponses,
    ];
    this.bonneReponse = this.currentQuestion.bonne_reponse;
    this.extraitMusique = this.currentQuestion.musique
      ? new Audio(`/assets/extraits/${this.currentQuestion.musique}.mp3`)
      : null;
    this.extraitBloque.set(this.currentQuestion.jouee_apres_question);
  }

  melangerReponses() {
    if (this.modeQuestionSelected === ModeQuestion.Duo) {
      this.reponsesDisplay = [
        this.currentQuestion!.bonne_reponse,
        this.currentQuestion!.mauvaises_reponses[
          Math.floor(Math.random() * this.currentQuestion!.mauvaises_reponses.length)
        ],
      ];
      if (Math.random() < 0.5) {
        this.reponsesDisplay.reverse();
      }
    } else {
      for (let i = this.reponsesDisplay.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.reponsesDisplay[i], this.reponsesDisplay[j]] = [
          this.reponsesDisplay[j],
          this.reponsesDisplay[i],
        ];
      }
    }
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
    }
  }

  qualifierJoueur(joueurs: string[]) {
    this.joueursStore.setQualifiesCompet(joueurs);
    this.competService.setJoueursCompet(joueurs).subscribe();
    this.scoresStore.initScores(joueurs);
    this.partieStore.resetIndexCurrentQuestion();
  }

  playExtrait() {
    if (this.extraitMusique && this.extraitBloque() === false) {
      this.extraitMusique.play();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (!this.bonneReponseShown) {
          if (!this.showQuestion) {
            this.showQuestion = true;
          } else if (this.showQuestion && !this.showModeSelection) {
            this.showModeSelection = true;
          } else if (this.reponseAlreadySelected) {
            this.bonneReponseShown = true;
            if (this.isBonneReponseGiven) {
              Jingles.sonBonneReponse.play();
              this.scoresQualifs[this.indexJoueur].score +=
                this.modeQuestionSelected === ModeQuestion.Duo ? 1 : 3;
              this.scoresStore.setPanneauJoueurs(this.scoresQualifs);
            } else {
              Jingles.sonMauvaiseReponse.play();
            }
          }
        }
        break;

      case CodeTouches.buttonSCode:
        if (this.modeQuestionSelected === ModeQuestion.Cash) {
          Jingles.selectionReponse.play();
          this.reponseAlreadySelected = true;
          this.extraitBloque.set(false);
          this.stopChrono();
        }
        break;

      case CodeTouches.buttonTCode:
        if (this.reponseAlreadySelected) {
          this.bonneReponseShown = true;
          Jingles.sonBonneReponse.play();
          this.scoresQualifs[this.indexJoueur].score += 5;
          this.scoresStore.setPanneauJoueurs(this.scoresQualifs);
        }
        break;

      case CodeTouches.buttonFCode:
        if (this.reponseAlreadySelected) {
          this.bonneReponseShown = true;
          Jingles.sonMauvaiseReponse.play();
        }
        break;

      case CodeTouches.rightArrowCode:
        if (this.bonneReponseShown) {
          if (this.questionIndex < this.questionsQualifs.length - 1) {
            this.prepareNextQuestion();
          } else {
            this.showButtonToCompet = true;
            this.calculerQualification();
          }
        }
        break;

      default:
        break;
    }
  }
}
