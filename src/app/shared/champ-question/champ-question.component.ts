
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TypeChamp } from '../champ-reponse/type-champ.enum';

@Component({
  selector: 'champ-question',
  imports: [MatIconModule],
  templateUrl: './champ-question.component.html',
  styleUrl: './champ-question.component.scss',
})
export class ChampQuestionComponent {
  private _question: string = '';

  @Input() set question(q: string) {
    this._question = q;
  }

  get question() {
    return this._question;
  }

  private _extraitMusique: string = '';

  @Input() set extraitMusique(e: string) {
    this._extraitMusique = e;
  }

  get extraitMusique() {
    return this._extraitMusique;
  }

  private _extraitBloque: boolean = false;

  @Input() set extraitBloque(eb: boolean) {
    this._extraitBloque = eb;
  }

  get extraitBloque() {
    return this._extraitBloque;
  }

  private _showQuestion: boolean = false;

  @Input() set showQuestion(show: boolean) {
    this._showQuestion = show;
  }

  get showQuestion() {
    return this._showQuestion;
  }

  private _typeChamp: TypeChamp = TypeChamp.QUALIF;

  @Input() set typeChamp(typeChamp: TypeChamp) {
    this._typeChamp = typeChamp;
  }

  get typeChamp() {
    return this._typeChamp;
  }

  TypeChamp = TypeChamp;

  canPlayExtrait: boolean = true;

  playExtrait() {
    const extrait = this.extraitMusique
      ? new Audio(`/assets/extraits/${this.extraitMusique}.mp3`)
      : null;
    if (extrait !== null && this.extraitBloque === false && this.canPlayExtrait) {
      this.canPlayExtrait = false;
      extrait.onended = () => {
        this.canPlayExtrait = true;
      };
      extrait.play();
    }
  }
}
