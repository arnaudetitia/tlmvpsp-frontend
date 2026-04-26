import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'choix-super-cash',
  imports: [CommonModule],
  templateUrl: './choix-super-cash.component.html',
  styleUrl: './choix-super-cash.component.scss',
})
export class ChoixSuperCashComponent {
  @Input() selectedQuestion: Map<number, boolean> = new Map();
  @Input() alreadyPlayed: Map<number, boolean> = new Map();

  @Output() onQuestionSelected = new EventEmitter<number>();

  selectSuperCash(idQuestion: number) {
    if (!this.alreadyPlayed.get(idQuestion)) {
      this.onQuestionSelected.emit(idQuestion);
    }
  }
}
