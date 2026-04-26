import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'champ-theme',
  templateUrl: './champ-theme.component.html',
  styleUrls: ['./champ-theme.component.scss'],
})
export class ChampTheme {
  @Input() idTheme: number = -1;
  @Input() libelleTheme: string | null = null;
  @Input() themeChallengerSelected = false;
  @Input() themeChampionSelected = false;
  @Input() isThemeChallenger = false;
  @Input() isThemeChampion = false;

  @Output() onSelectedTheme = new EventEmitter<number>();

  constructor() {}

  selectTheme(idTheme: number) {
    this.onSelectedTheme.emit(idTheme);
  }
}
