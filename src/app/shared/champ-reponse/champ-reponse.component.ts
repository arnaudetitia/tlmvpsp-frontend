import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TypeChamp } from './type-champ.enum';

@Component({
  selector: 'champ-reponse',
  templateUrl: './champ-reponse.component.html',
  styleUrls: ['./champ-reponse.component.scss'],
})
export class ChampReponseComponent {
  @Input() typeChamp: TypeChamp = TypeChamp.QUALIF;
  @Input() reponse: string = '';
  @Input() selected: boolean = false;
  @Input() reponseAlreadySelected: boolean = false;
  @Input() bonneReponseShown: boolean = false;
  @Input() isBonneReponse: boolean = false;
  @Input() isSelectionnable: boolean = false;
  @Input() isProposition: boolean = false;

  @Output() reponseSelected = new EventEmitter<string>();
  TypeChamp = TypeChamp;

  selectionReponseAudio: HTMLAudioElement = new Audio('/assets/jingles/selectionReponse.mp3');

  constructor() {}

  selectionReponse() {
    if (!this.reponseAlreadySelected && this.isSelectionnable) {
      this.selected = true;
      if (this.typeChamp !== TypeChamp.COMPET) {
        this.selectionReponseAudio.play();
        this.reponseSelected.emit(this.reponse);
      }
    }
  }
}
