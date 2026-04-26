import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { RecapDefiChallenger, RecapQuestion } from '../model/recap-defi-challenger.model';
import { CommonModule } from '@angular/common';
import { ChampReponseComponent } from '../../../shared/champ-reponse/champ-reponse.component';
import { CodeTouches } from '../../../models/code-touches.enum';
import { Jingles } from '../../../models/jingles.models';
import { ModeQuestion } from '../../../models/mode-question.models';
import { PartieStore } from '../../../store/partie.store';

@Component({
  selector: 'defi-challenger-verif',
  imports: [CommonModule, ChampReponseComponent],
  templateUrl: './defi-challenger-verif.component.html',
  styleUrls: ['./defi-challenger-verif.component.scss'],
})
export class DefiChallengerVerifComponent implements OnInit {
  @Input() recap: RecapDefiChallenger = {} as RecapDefiChallenger;

  @Output() onBonneReponseGiven = new EventEmitter<ModeQuestion | null>();

  @Output() onVerifDefiTermine = new EventEmitter<void>();

  showBonneReponse: boolean = false;

  indexQuestion: number = 0;

  currentQuestion: RecapQuestion = {} as RecapQuestion;

  constructor(private partieStore: PartieStore) {}

  ngOnInit(): void {
    this.currentQuestion = this.recap.recapQuestions[this.indexQuestion];
  }

  preparerNextQuestion() {
    if (this.indexQuestion === this.recap.recapQuestions.length - 1) {
      this.onVerifDefiTermine.emit();
    } else {
      this.indexQuestion++;
      this.partieStore.setIndexCurrentQuestion(this.indexQuestion);
      this.currentQuestion = this.recap.recapQuestions[this.indexQuestion];
      this.showBonneReponse = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (this.currentQuestion.propositions.length) {
          this.showBonneReponse = true;
          if (this.currentQuestion.bonneReponse === this.currentQuestion.reponseDonnee) {
            Jingles.sonBonneReponse.play();
            this.onBonneReponseGiven.emit(this.currentQuestion.modeQuestion);
          } else {
            Jingles.sonMauvaiseReponse.play();
          }
        }
        break;

      case CodeTouches.buttonTCode:
        this.showBonneReponse = true;
        Jingles.sonBonneReponse.play();
        this.onBonneReponseGiven.emit(this.currentQuestion.modeQuestion);
        break;

      case CodeTouches.buttonFCode:
        this.showBonneReponse = true;
        Jingles.sonMauvaiseReponse.play();
        break;

      case CodeTouches.rightArrowCode:
        if (this.showBonneReponse) {
          this.preparerNextQuestion();
        }
        break;

      default:
        break;
    }

    $event.stopPropagation();
  }
}
