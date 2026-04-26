import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ModeQuestion } from '../../../models/mode-question.models';
import { CommonModule } from '@angular/common';
import { ChoixModeComponent } from '../../../shared/choix-mode/choix-mode.compoent';
import { ChampReponseComponent } from '../../../shared/champ-reponse/champ-reponse.component';
import { Defi, QuestionDefi } from '../../../models/defi.model';
import { CodeTouches } from '../../../models/code-touches.enum';
import { TypeChamp } from '../../../shared/champ-reponse/type-champ.enum';
import { FormsModule } from '@angular/forms';
import { RecapQuestion } from '../model/recap-defi-challenger.model';
import { Jingles } from '../../../models/jingles.models';
import { PartieStore } from '../../../store/partie.store';

@Component({
  selector: 'defi-joueur',
  imports: [CommonModule, ChoixModeComponent, ChampReponseComponent, FormsModule],
  templateUrl: './defi-joueur.component.html',
  styleUrls: ['./defi-joueur.component.scss'],
})
export class DefiJoueurComponent implements OnInit {
  @Input() defi: Defi | undefined;
  @Input() isChampion: boolean = false;

  @Output() onQuestionRepondue = new EventEmitter<RecapQuestion>();
  @Output() onBonneReponseGiven = new EventEmitter<ModeQuestion | null>();
  @Output() onDefiTermine = new EventEmitter<void>();

  TypeChamp = TypeChamp;

  showQuestion = false;
  showModeSelection: boolean = false;

  indexQuestion: number = 0;
  currentQuestion: QuestionDefi | undefined;
  modeQuestionSelected: ModeQuestion | null = null;
  reponsesDisplay: string[] = [];
  reponseAlreadySelected = false;

  bonneReponse = '';
  bonneReponseShown = false;
  isBonneReponseGiven = false;
  reponseGiven = '';

  modeQuestion = ModeQuestion;

  reponseCash = '';
  reponseCashEditing = false;

  constructor(private partireStore: PartieStore) {}

  ngOnInit() {
    this.currentQuestion = this.defi?.questionsDefi[this.indexQuestion];
    if (this.currentQuestion) {
      this.bonneReponse = this.currentQuestion.bonneReponse;
      this.reponsesDisplay = [
        this.currentQuestion?.bonneReponse,
        ...this.currentQuestion?.mauvaisesReponses,
      ];
    }
  }

  onModeSelected(mode: ModeQuestion) {
    this.modeQuestionSelected = mode;
    this.melangerReponses();
    Jingles.sonChronoDefi.play();
  }

  onReponseSelected($event: any) {
    this.reponseAlreadySelected = true;
    this.reponseGiven = $event;
    this.isBonneReponseGiven = $event === this.bonneReponse;
    this.stopChrono();
  }

  stopChrono() {
    Jingles.sonChronoDefi.pause();
    Jingles.sonChronoDefi.currentTime = 0;
  }

  melangerReponses() {
    if (this.modeQuestionSelected === ModeQuestion.Duo) {
      this.reponsesDisplay = [
        this.currentQuestion!.bonneReponse,
        this.currentQuestion!.mauvaisesReponses[
          Math.floor(Math.random() * this.currentQuestion!.mauvaisesReponses.length)
        ],
      ];
      if (Math.random() < 0.5) {
        this.reponsesDisplay.reverse();
      }
    } else if (this.modeQuestionSelected === ModeQuestion.Carre) {
      for (let i = this.reponsesDisplay.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.reponsesDisplay[i], this.reponsesDisplay[j]] = [
          this.reponsesDisplay[j],
          this.reponsesDisplay[i],
        ];
      }
    } else {
      this.reponsesDisplay = [];
    }
  }

  prepareNextQuestion() {
    this.indexQuestion++;
    if (this.indexQuestion === 6) {
      this.onDefiTermine.emit();
    } else {
      this.partireStore.setIndexCurrentQuestion(this.indexQuestion);
      this.currentQuestion = this.defi?.questionsDefi[this.indexQuestion];
      if (this.currentQuestion) {
        this.bonneReponse = this.currentQuestion.bonneReponse;
        this.reponsesDisplay = [
          this.currentQuestion?.bonneReponse,
          ...this.currentQuestion?.mauvaisesReponses,
        ];
        this.modeQuestionSelected = null;
        this.showQuestion = false;
        this.showModeSelection = false;
        this.reponseAlreadySelected = false;
        this.isBonneReponseGiven = false;
        this.bonneReponseShown = false;
        this.reponseCash = '';
        this.reponseGiven = '';
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
        if (!this.showQuestion) {
          this.showQuestion = true;
        } else if (this.showQuestion && !this.showModeSelection) {
          this.showModeSelection = true;
        } else if (this.reponseAlreadySelected && this.isChampion && !this.bonneReponseShown) {
          this.bonneReponseShown = true;
          if (this.isBonneReponseGiven) {
            Jingles.sonBonneReponse.play();
            this.onBonneReponseGiven.emit(this.modeQuestionSelected);
          } else {
            Jingles.sonMauvaiseReponse.play();
          }
        }
        break;

      case CodeTouches.buttonSCode:
        if (!this.reponseCashEditing) {
          Jingles.selectionReponse.play();
          this.reponseAlreadySelected = true;
          this.stopChrono();
        }
        break;

      case CodeTouches.buttonTCode:
        if (this.isChampion && this.reponseAlreadySelected) {
          this.bonneReponseShown = true;
          Jingles.sonBonneReponse.play();
          this.onBonneReponseGiven.emit(this.modeQuestionSelected);
        }
        break;

      case CodeTouches.buttonFCode:
        if (this.isChampion && this.reponseAlreadySelected) {
          this.bonneReponseShown = true;
          Jingles.sonMauvaiseReponse.play();
        }
        break;

      case CodeTouches.rightArrowCode:
        if (
          (!this.isChampion && this.reponseAlreadySelected) ||
          (this.isChampion && this.bonneReponseShown)
        ) {
          this.onQuestionRepondue.emit({
            question: this.currentQuestion ? this.currentQuestion.question : '',
            modeQuestion: this.modeQuestionSelected,
            propositions: this.reponsesDisplay,
            reponseDonnee: this.reponseGiven || this.reponseCash,
            bonneReponse: this.bonneReponse,
          });
          this.prepareNextQuestion();
        }
        break;

      default:
        break;
    }

    $event.stopPropagation();
  }
}
