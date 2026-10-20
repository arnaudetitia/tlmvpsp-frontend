import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TypeChamp } from '../champ-reponse/type-champ.enum';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'champ-question',
  imports: [MatIconModule],
  templateUrl: './champ-question.component.html',
  styleUrl: './champ-question.component.scss',
})
export class ChampQuestionComponent {
  @Input() question: string = '';

  @Input() extraitQuestion: string = '';

  @Input() extraitReponse: string = '';

  @Input() showQuestion: boolean = false;

  @Input() extraitReponseBloque: boolean = true;

  @Input() typeChamp: TypeChamp = TypeChamp.QUALIF;

  TypeChamp = TypeChamp;

  canPlayExtrait: boolean = true;

  playExtrait(exrtaitToPlay: string, bloque: boolean = false) {
    const extrait = exrtaitToPlay
      ? new Audio(`${environment.soundDirectory}/extraits/${exrtaitToPlay}.mp3`)
      : null;
    if (extrait !== null && !bloque && this.canPlayExtrait) {
      this.canPlayExtrait = false;
      extrait.onended = () => {
        this.canPlayExtrait = true;
      };
      extrait.play();
    }
  }
}
