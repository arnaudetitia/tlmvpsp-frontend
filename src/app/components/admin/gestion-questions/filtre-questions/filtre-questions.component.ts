import { Component, computed, effect, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FiltreQuestionType } from '../../../../models/enums/filtre-questions.enum';
import { PartieService } from '../../../../services/partie.service';
import { Partie, ThemeCompet, ThemeDefi } from '../../../../models/partie.model';
import { combineLatest, tap } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { TypeThemeEnum } from '../../../../models/enums/type-theme.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'filtre-questions',
  imports: [MatSelectModule, MatOptionModule, MatInputModule, MatIconModule],
  templateUrl: './filtre-questions.component.html',
  styleUrl: './filtre-questions.component.scss',
})
export class FiltreQuestionsComponent implements OnInit {
  FiltreQuestionType = FiltreQuestionType;
  FiltreQuestionTypeLabels = Object.values(FiltreQuestionType).filter(
    (value) => typeof value === 'string',
  ) as string[];

  TypeTheme = TypeThemeEnum;
  TypeThemeLabels = Object.values(TypeThemeEnum).filter(
    (value) => typeof value === 'string',
  ) as string[];

  currentFiltreType = signal<FiltreQuestionType | null>(null);
  currentTypeThemeType = signal<TypeThemeEnum | null>(null);

  allParties = signal<Partie[]>([]);
  allThemesCompet = signal<ThemeCompet[]>([]);
  allThemesDefi = signal<ThemeDefi[]>([]);

  themesDisplayed = computed(() => {
    switch (this.currentTypeThemeType()) {
      case TypeThemeEnum.COMPET:
        return this.allThemesCompet();
      case TypeThemeEnum.DEFI:
        return this.allThemesDefi();
      default:
        return null;
    }
  });

  @Output() onFiltreTypeChange = new EventEmitter<FiltreQuestionType | null>();
  @Output() onFiltreThemeTypeChange = new EventEmitter<TypeThemeEnum | null>();
  @Output() onResetFilter = new EventEmitter<void>();
  @Output() onFiltreValueChange = new EventEmitter<{
    typeFiltre: FiltreQuestionType;
    value: Partie | number | boolean | string;
  }>();

  constructor(private partieService: PartieService) {
    effect(() => {
      this.onFiltreTypeChange.emit(this.currentFiltreType());
      this.onFiltreThemeTypeChange.emit(this.currentTypeThemeType());
    });
  }

  ngOnInit() {
    combineLatest([
      this.partieService.getAllParties(),
      this.partieService.getAllThemesCompet(),
      this.partieService.getAllThemesDefi(),
    ])
      .pipe(
        tap(([parties, themesCompet, themeDefi]) => {
          this.allParties.set(parties);
          this.allThemesCompet.set(themesCompet);
          this.allThemesDefi.set(themeDefi);
        }),
      )
      .subscribe();
  }

  registerFilterType(value: string) {
    this.currentFiltreType.set(FiltreQuestionType[value as keyof typeof FiltreQuestionType]);
  }

  registerFilterThemeType(value: string) {
    this.currentTypeThemeType.set(TypeThemeEnum[value as keyof typeof TypeThemeEnum]);
  }

  onFilterValueChange($event: any) {
    switch (this.currentFiltreType()) {
      case FiltreQuestionType.PARTIE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreQuestionType.PARTIE,
          value: $event.value as Partie,
        });
        break;
      case FiltreQuestionType.THEME:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreQuestionType.THEME,
          value: $event.value as number,
        });
        break;
      case FiltreQuestionType.MUSIQUE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreQuestionType.MUSIQUE,
          value: $event.value as boolean,
        });
        break;
      case FiltreQuestionType.TEXTE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreQuestionType.TEXTE,
          value: $event as string,
        });
        break;
    }
  }
}
