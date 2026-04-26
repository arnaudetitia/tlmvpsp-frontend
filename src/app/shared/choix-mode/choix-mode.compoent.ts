import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModeQuestion } from '../../models/mode-question.models';

@Component({
  selector: 'choix-mode',
  imports: [],
  templateUrl: './choix-mode.compoent.html',
  styleUrls: ['./choix-mode.compoent.scss'],
})
export class ChoixModeComponent {
  @Input() isChampion: boolean = false;
  @Output() modeSelected = new EventEmitter<ModeQuestion>();

  modeQuestion = ModeQuestion;
  onModeSelected(mode: ModeQuestion) {
    this.modeSelected.emit(mode);
  }
}
