import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChampTheme } from '../../../shared/champ-theme/champ-theme.component';
import { ThemeDefi } from '../../../models/theme-defi.model';

import { Jingles } from '../../../models/jingles.models';

@Component({
  selector: 'choix-theme',
  imports: [ChampTheme],
  templateUrl: './choix-theme.component.html',
  styleUrls: ['./choix-theme.component.scss'],
})
export class ChoixThemeComponent {
  @Input() themesDefi: ThemeDefi[] = [];

  @Output() onThemeChallengerSelected = new EventEmitter<number>();
  @Output() onThemeChampionSelected = new EventEmitter<number>();

  themeChallenger: number | undefined;
  themeChampion: number | undefined;

  themeChallengerSelected = false;
  themeChampionSelected = false;

  selectTheme($event: any) {
    if (!this.themeChallengerSelected) {
      this.themeChallenger = $event;
      this.themeChallengerSelected = true;
      Jingles.sonSelectionThemeChallenger.play();
      this.onThemeChallengerSelected.emit($event);
    } else if (!this.themeChampionSelected) {
      this.themeChampion = $event;
      this.themeChampionSelected = true;
      Jingles.sonSelectionThemeChampion.play();
      this.onThemeChampionSelected.emit($event);
    }
  }
}
