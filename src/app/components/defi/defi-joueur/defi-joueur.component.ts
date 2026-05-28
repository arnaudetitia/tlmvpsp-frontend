import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { ModeQuestion } from '../../../models/mode-question.models';

import { ChoixModeComponent } from '../../../shared/choix-mode/choix-mode.compoent';
import { ChampReponseComponent } from '../../../shared/champ-reponse/champ-reponse.component';
import { Defi, QuestionDefi } from '../../../models/defi.model';
import { CodeTouches } from '../../../models/enums/code-touches.enum';
import { TypeChamp } from '../../../shared/champ-reponse/type-champ.enum';
import { FormsModule } from '@angular/forms';
import { RecapQuestion } from '../model/recap-defi-challenger.model';
import { Jingles } from '../../../models/jingles.models';
import { PartieStore } from '../../../store/partie.store';
import { SortAndMixReponsesUtils } from '../../../utils/sort-and-mix-reponses.util';
import { QuestionStore } from '../../../store/question.store';
import { EtatQuestion } from '../../../models/enums/etat-question.enum';
import { ChampQuestionComponent } from '../../../shared/champ-question/champ-question.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { ManchesEnum } from '../../../models/enums/manches.enum';
import { tap } from 'rxjs';

@Component({
  selector: 'defi-joueur',
  imports: [
    ChoixModeComponent,
    ChampQuestionComponent,
    ChampReponseComponent,
    MatGridListModule,
    FormsModule,
  ],
  templateUrl: './defi-joueur.component.html',
  styleUrls: ['./defi-joueur.component.scss'],
})
export class DefiJoueurComponent implements OnInit {
  @Input() defi: Defi = {} as Defi;
  @Input() isChampion: boolean = false;

  @Output() onQuestionRepondue = new EventEmitter<RecapQuestion>();
  @Output() onBonneReponseGiven = new EventEmitter<ModeQuestion | null>();
  @Output() onDefiTermine = new EventEmitter<void>();

  TypeChamp = TypeChamp;
  EtatQuestion = EtatQuestion;
  mancheDefi = ManchesEnum.DEFI_CHALLENGER;
  currentQuestionState = signal<EtatQuestion>(EtatQuestion.START_QUESTION);

  indexQuestion = signal<number>(0);
  currentQuestion = computed(() => this.defi?.questionsDefi[this.indexQuestion()]);
  modeQuestionSelected: ModeQuestion | null = null;
  reponsesDisplay: string[] = [];

  bonneReponse = computed(() => this.currentQuestion()?.bonneReponse || '');
  bonneReponseShown = false;
  reponseGiven = signal<string>('');

  isBonneReponseGiven = computed(() => this.reponseGiven() === this.bonneReponse());

  modeQuestion = ModeQuestion;

  reponseCash = '';
  reponseCashEditing = false;

  constructor(
    private partireStore: PartieStore,
    private questionStore: QuestionStore,
  ) {}

  ngOnInit() {
    this.mancheDefi = this.isChampion ? ManchesEnum.DEFI_CHAMPION : ManchesEnum.DEFI_CHALLENGER;

    if (this.currentQuestion) {
      this.reponsesDisplay = [
        this.currentQuestion().bonneReponse,
        ...this.currentQuestion().mauvaisesReponses,
      ];
    }
    this.questionStore.etatQuestion$
      .pipe(
        tap((etat) => {
          this.currentQuestionState.set(etat);
          if (
            this.isChampion &&
            this.currentQuestionState() === EtatQuestion.BONNE_REPONSE_AFFICHEE &&
            this.modeQuestionSelected !== ModeQuestion.Cash
          ) {
            if (this.isBonneReponseGiven()) {
              Jingles.sonBonneReponse.play();
              this.onBonneReponseGiven.emit(this.modeQuestionSelected);
            } else {
              Jingles.sonMauvaiseReponse.play();
            }
          }
        }),
      )
      .subscribe();
  }

  onModeSelected(mode: ModeQuestion) {
    this.modeQuestionSelected = mode;
    this.reponsesDisplay = SortAndMixReponsesUtils.trierReponses(
      this.reponsesDisplay,
      this.modeQuestionSelected,
      this.currentQuestion()?.tri,
    );
    this.questionStore.passerEtatSuivant(this.mancheDefi);
    Jingles.sonChronoDefi.play();
  }

  onReponseSelected($event: any) {
    this.stopChrono();
    this.reponseGiven.set($event);
    this.questionStore.passerEtatSuivant(this.mancheDefi);
  }

  stopChrono() {
    Jingles.sonChronoDefi.pause();
    Jingles.sonChronoDefi.currentTime = 0;
  }

  prepareNextQuestion() {
    this.indexQuestion.update((value) => value + 1);
    if (this.indexQuestion() === 6) {
      this.onDefiTermine.emit();
      this.questionStore.passerEtatSuivant(this.mancheDefi);
    } else {
      this.partireStore.setIndexCurrentQuestion(this.indexQuestion());
      if (this.currentQuestion()) {
        this.reponsesDisplay = [this.bonneReponse(), ...this.currentQuestion().mauvaisesReponses];
        this.questionStore.passerEtatSuivant(this.mancheDefi);
        this.reponseGiven.set('');
        this.reponseCash = '';
      }
    }
  }

  onReponseCashFocus() {
    this.reponseCashEditing = true;
  }

  onReponseCashBlur() {
    this.reponseCashEditing = false;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (
          ![
            EtatQuestion.CHOIX_MODE_QUESTION,
            EtatQuestion.REPONSES_PROPOSEES,
            EtatQuestion.BONNE_REPONSE_AFFICHEE,
            ...(!this.isChampion ? [EtatQuestion.REPONSE_JOUEUR_DONNEE] : []),
          ].includes(this.currentQuestionState())
        ) {
          if (
            this.currentQuestionState() !== EtatQuestion.REPONSE_JOUEUR_DONNEE ||
            this.modeQuestionSelected !== ModeQuestion.Cash
          ) {
            this.questionStore.passerEtatSuivant(this.mancheDefi);
          }
        }
        break;

      case CodeTouches.buttonSCode:
        if (!this.reponseCashEditing) {
          Jingles.selectionReponse.play();
          this.questionStore.passerEtatSuivant(this.mancheDefi);
          this.stopChrono();
        }
        break;

      case CodeTouches.buttonTCode:
        if (
          this.isChampion &&
          this.currentQuestionState() === EtatQuestion.REPONSE_JOUEUR_DONNEE &&
          this.modeQuestionSelected === ModeQuestion.Cash
        ) {
          this.questionStore.passerEtatSuivant(this.mancheDefi);
          Jingles.sonBonneReponse.play();
          this.onBonneReponseGiven.emit(this.modeQuestionSelected);
        }
        break;

      case CodeTouches.buttonFCode:
        if (
          this.isChampion &&
          this.currentQuestionState() === EtatQuestion.REPONSE_JOUEUR_DONNEE &&
          this.modeQuestionSelected === ModeQuestion.Cash
        ) {
          this.questionStore.passerEtatSuivant(this.mancheDefi);
          Jingles.sonMauvaiseReponse.play();
        }
        break;

      case CodeTouches.rightArrowCode:
        if (
          (!this.isChampion &&
            this.currentQuestionState() === EtatQuestion.REPONSE_JOUEUR_DONNEE) ||
          (this.isChampion && this.currentQuestionState() === EtatQuestion.BONNE_REPONSE_AFFICHEE)
        ) {
          if (!this.isChampion) {
            this.onQuestionRepondue.emit({
              question: this.currentQuestion() ? this.currentQuestion().question : '',
              modeQuestion: this.modeQuestionSelected,
              propositions: this.reponsesDisplay,
              reponseDonnee: this.reponseGiven() || this.reponseCash,
              bonneReponse: this.bonneReponse(),
            });
          }
          this.prepareNextQuestion();
        }
        break;

      default:
        break;
    }

    $event.stopPropagation();
  }
}
