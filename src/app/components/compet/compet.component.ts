import { Component, HostListener, OnInit } from '@angular/core';
import { CompetService } from '../../services/compet.service';
import { combineLatest, Observable, of, tap } from 'rxjs';
import { ChampReponseComponent } from '../../shared/champ-reponse/champ-reponse.component';
import { TypeChamp } from '../../shared/champ-reponse/type-champ.enum';
import { CommonModule } from '@angular/common';
import { Compet, QuestionCompet } from '../../models/compet.model';
import { ModeQuestion } from '../../models/mode-question.models';
import { ChoixSuperCashComponent } from './choix-super-cash/choix-super-cash.component';
import { CodeTouches } from '../../models/code-touches.enum';
import { Jingles } from '../../models/jingles.models';
import { JoueursStore } from '../../store/joueurs.store';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { PanneauScoreJoueursComponent } from '../../shared/panneau-score-joueurs/panneau-score-joueurs.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ScoresStore } from '../../store/scores.store';
import { PartieStore } from '../../store/partie.store';

@Component({
  selector: 'app-compet',
  imports: [
    CommonModule,
    ChampReponseComponent,
    ChoixSuperCashComponent,
    PanneauScoreJoueursComponent,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './compet.component.html',
  styleUrls: ['./compet.component.scss'],
})
export class CompetComponent implements OnInit {
  compet$: Observable<any> = of(null);
  compet: Compet | null = null;
  theme: string = '';
  votesDisabled = false;

  indexQuestion = 0;
  questionList: QuestionCompet[] = [];
  question: QuestionCompet | null = null;
  showQuestion: boolean = false;
  showReponses: boolean = false;
  extraitMusique: HTMLAudioElement | null = null;

  reponsesDisplay: string[] = [];
  isBonneReponseGiven: boolean = false;
  bonneReponseShown: boolean = false;
  bonneReponse: string = '';
  questionAliases: string[] = [];

  functionFreezeVote = () => this.competService.freezeVotes().subscribe();

  TypeChamp = TypeChamp;

  spacebarCode: string = 'Space';
  rightArrowCode: string = 'ArrowRight';

  scoresCompet: PanneauJoueur[] = [];
  joueursAvecBonneReponse: string[] = [];
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

  showSuperCash = false;
  inedxQuestionSuperCashChoisi = false;

  competTermmine = false;

  constructor(
    private competService: CompetService,
    private joueursStore: JoueursStore,
    private scoresStore: ScoresStore,
    private partieStore: PartieStore,
  ) {}

  ngOnInit() {
    this.scoresStore
      .getPanneauxJoueurs()
      .pipe(
        tap((panneauJoueurs) => {
          this.scoresCompet = panneauJoueurs;
        }),
      )
      .subscribe();
    this.compet$ = combineLatest([
      this.competService.getCompet(),
      this.partieStore.getIndexCurrentQuestion(),
      this.partieStore.getAlreadyPlayedQuestions(),
      this.partieStore.getOrdreJoueursSuperCash(),
      this.partieStore.getIndexJoueurSuperCash(),
    ]).pipe(
      tap(
        ([
          data,
          indexCurrentQuestion,
          alreadyPlayedQuestionsMap,
          ordreJoueursSuperCash,
          indexJoueurSuperCash,
        ]) => {
          this.indexQuestion = indexCurrentQuestion;
          this.compet = data;
          this.theme = data.libelle_theme;
          this.questionList = data.questions_compet.map((question) => {
            let modeQuestion: ModeQuestion;
            switch (question.mauvaises_reponses.length) {
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
          this.alreadyPlayed = alreadyPlayedQuestionsMap;
          this.ordreJoueurSuperCash = ordreJoueursSuperCash;
          this.indexJoueurSuperCash = indexJoueurSuperCash;
          this.question = this.questionList[this.indexQuestion];
          this.reponsesDisplay = [this.question.bonne_reponse, ...this.question.mauvaises_reponses];
          this.extraitMusique = this.question.musique
            ? new Audio(`/assets/extraits/${this.question.musique}.mp3`)
            : null;
          this.melangerReponses();
          this.competService
            .setQuestionToRemote(this.question.question, this.reponsesDisplay)
            .subscribe();
        },
      ),
    );

    Jingles.sonChronoCompet.onended = this.functionFreezeVote;
    Jingles.sonChronoCompetLong.onended = this.functionFreezeVote;
  }

  melangerReponses() {
    for (let i = this.reponsesDisplay.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.reponsesDisplay[i], this.reponsesDisplay[j]] = [
        this.reponsesDisplay[j],
        this.reponsesDisplay[i],
      ];
    }
  }

  preparerProchaineQuestion() {
    this.showQuestion = false;
    this.showReponses = false;
    this.bonneReponseShown = false;
    this.indexQuestion++;
    this.partieStore.setIndexCurrentQuestion(this.indexQuestion);
    if (this.indexQuestion >= 8 && !this.showSuperCash) {
      this.calulerOrdreCandidats();
      this.selectedJoueurSuperCash = this.ordreJoueurSuperCash[this.indexJoueurSuperCash];
      this.showSuperCash = true;
      return;
    }
    this.question = this.questionList[this.indexQuestion];
    this.reponsesDisplay = [this.question.bonne_reponse, ...this.question.mauvaises_reponses];
    this.questionAliases = this.question.aliases;
    this.extraitMusique = this.question.musique
      ? new Audio(`/assets/extraits/${this.question.musique}.mp3`)
      : null;
    this.melangerReponses();
    this.competService
      .setQuestionToRemote(this.question.question, this.reponsesDisplay)
      .subscribe();
  }

  playExtrait() {
    if (this.extraitMusique) {
      this.extraitMusique.play();
    }
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
    this.indexQuestion = idQuestion;
    this.inedxQuestionSuperCashChoisi = true;
    this.selectedQuestion.set(this.indexQuestion, true);
    this.question = this.questionList[idQuestion];
    this.extraitMusique = this.question.musique
      ? new Audio(`/assets/extraits/${this.question.musique}.mp3`)
      : null;
  }

  stopChrono() {
    Jingles.sonChronoCompet.pause();
    Jingles.sonChronoCompet.currentTime = 0;
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
    switch (this.question?.mode) {
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
        if (this.indexQuestion < 8 || this.inedxQuestionSuperCashChoisi) {
          if (!this.showQuestion) {
            this.showQuestion = true;
          } else if (!this.showReponses) {
            this.showReponses = true;
            this.competService.openVotes().subscribe();
            if (!this.showSuperCash && this.question?.mode === ModeQuestion.Cash) {
              Jingles.sonChronoCompetLong.play();
            } else {
              Jingles.sonChronoCompet.play();
            }
          } else if (!this.bonneReponseShown) {
            Jingles.sonBonneReponse.play();
            this.bonneReponseShown = true;
          }
        }
        break;
      case CodeTouches.rightArrowCode:
        if (this.bonneReponseShown) {
          this.augmenterScore();
          this.resetReponsesJoueurs();
          if (this.indexQuestion < 8) {
            this.preparerProchaineQuestion();
          } else {
            if (this.votesDisabled) {
              this.competService
                .closeVotes()
                .pipe(tap(() => (this.votesDisabled = true)))
                .subscribe();
            }
            this.inedxQuestionSuperCashChoisi = false;
            this.showQuestion = false;
            this.showReponses = false;
            this.bonneReponseShown = false;
            this.alreadyPlayed.set(this.indexQuestion, true);
            this.partieStore.setAlreadyPlayedQuestions(this.alreadyPlayed);
            if (Array.from(this.alreadyPlayed.values()).every((jouee) => jouee === true)) {
              this.calculerQualification();
            }
            this.indexJoueurSuperCash++;
            this.partieStore.setIndexJoueurSuperCash(this.indexJoueurSuperCash);
            this.selectedJoueurSuperCash = this.ordreJoueurSuperCash[this.indexJoueurSuperCash];
          }
        }
        break;
      case CodeTouches.buttonTCode:
        this.bonneReponseShown = true;
        this.modifierScoreJoueur(this.selectedJoueurSuperCash, 5);
        Jingles.sonBonneReponse.play();
        break;
      case CodeTouches.buttonFCode:
        this.bonneReponseShown = true;
        this.modifierScoreJoueur(this.selectedJoueurSuperCash, -5);
        Jingles.sonMauvaiseReponse.play();
        break;
      case CodeTouches.buttonSCode:
        this.stopChrono();
        Jingles.sonFinChronoCompet.play();
        break;
    }
  }
}
