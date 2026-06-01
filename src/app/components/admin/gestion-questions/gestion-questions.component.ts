import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { QuestionService } from '../../../services/question.service';
import { QuestionExtended } from '../../../models/question.model';
import { ManchesEnum } from '../../../models/enums/manches.enum';
import { CapitalisationPipe } from '../../../pipes/capitalisation.pipe';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FiltreQuestionsComponent } from './filtre-questions/filtre-questions.component';
import { Partie } from '../../../models/partie.model';
import { FiltreQuestionType } from '../../../models/enums/filtre-questions.enum';
import { tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AddEditQuestionDialogComponent } from './add-edit-question-dialog.component/add-edit-question-dialog.component';

@Component({
  selector: 'app-gestion-questions.component',
  imports: [
    CommonModule,
    BoutonRetourComponent,
    CapitalisationPipe,
    FiltreQuestionsComponent,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './gestion-questions.component.html',
  styleUrl: './gestion-questions.component.scss',
})
export class GestionQuestionsComponent implements OnInit, OnDestroy {
  allQuestions = signal(new MatTableDataSource<QuestionExtended>([]));

  MancheEnum = ManchesEnum;

  mancheChoisie = signal<ManchesEnum>(ManchesEnum.QUALIFS);

  displayedColumnsBase = ['question', 'bonneReponse', 'mauvaisesReponses', 'triReponse'];

  bloquageManche = new Map([
    [ManchesEnum.QUALIFS, FiltreQuestionType.THEME],
    [ManchesEnum.DEFI, FiltreQuestionType.MUSIQUE],
  ]);

  displayedColumns = computed(() => {
    let newDisplayedColumn = this.displayedColumnsBase;
    if (this.mancheChoisie() !== ManchesEnum.QUALIFS) {
      newDisplayedColumn = ['theme', ...newDisplayedColumn];
    }
    if (this.mancheChoisie() !== ManchesEnum.DEFI) {
      newDisplayedColumn = [...newDisplayedColumn, 'musique'];
    }
    if (this.mancheChoisie() === ManchesEnum.COMPET) {
      newDisplayedColumn = [...newDisplayedColumn, 'aliases'];
    }
    return [...newDisplayedColumn, 'actions'];
  });

  currentFiltreType = signal<FiltreQuestionType | null>(null);
  filterPartie = signal<Partie | null>(null);
  filterTheme = signal<number | null>(null);
  filterMusique = signal<boolean | null>(null);
  filterTexte = signal<string>('');

  filtre = computed(() => {
    return {
      manche: this.mancheChoisie(),
      partie: this.filterPartie(),
      theme: this.filterTheme(),
      musique: this.filterMusique(),
      texte: this.filterTexte(),
    };
  });

  musiqueEnEcoute = '';
  extraitEnEcoute: HTMLAudioElement | null = null;

  openAddEditQuestionDialog = inject(MatDialog);

  constructor(private questionService: QuestionService) {
    effect(() => {
      if (
        this.currentFiltreType() === FiltreQuestionType.THEME &&
        this.mancheChoisie() === ManchesEnum.QUALIFS
      ) {
        this.mancheChoisie.set(ManchesEnum.COMPET);
      }
      if (
        this.currentFiltreType() === FiltreQuestionType.MUSIQUE &&
        this.mancheChoisie() === ManchesEnum.DEFI
      ) {
        this.mancheChoisie.set(ManchesEnum.QUALIFS);
      }
      this.allQuestions().filter = JSON.stringify(this.filtre());
    });
  }

  ngOnInit() {
    this.questionService
      .getAllQuestions()
      .pipe(
        tap((allQuestions) => {
          this.allQuestions().data = allQuestions;
        }),
      )
      .subscribe();
    this.allQuestions().filterPredicate = (question: QuestionExtended, filtre: string) => {
      const filtreParsed = JSON.parse(filtre);
      let questionInPartie = true;
      if (filtreParsed.partie) {
        const partieFilter = filtreParsed.partie;
        questionInPartie =
          [
            partieFilter.idCompet,
            ...partieFilter.themesDefi.map((theme: any) => theme.idTheme),
          ].includes(question.idTheme) ||
          [
            ...partieFilter.questionsQualifs.map(
              (questionQualif: any) => questionQualif.idQuestion,
            ),
          ].includes(question.id);
      }
      const themefilter = filtreParsed.theme;
      let questionHasRightTheme = true;
      if (themefilter) {
        questionHasRightTheme = themefilter === question.idTheme;
      }
      const musiqueFilter = filtreParsed.musique;
      let questionInFilterMusic = true;
      if (musiqueFilter !== null) {
        if (musiqueFilter) {
          questionInFilterMusic = question.musique !== null;
        } else {
          questionInFilterMusic = question.musique === null;
        }
      }
      const textFilter = filtreParsed.texte;
      let questionContainsTexte = true;
      if (textFilter) {
        questionContainsTexte = question.question.includes(textFilter);
        questionContainsTexte = questionContainsTexte || question.bonneReponse.includes(textFilter);
        questionContainsTexte =
          questionContainsTexte || question.mauvaisesReponses.some((mr) => mr.includes(textFilter));
      }
      return (
        question.mancheQuestion === filtreParsed.manche &&
        questionInPartie &&
        questionHasRightTheme &&
        questionInFilterMusic &&
        questionContainsTexte
      );
    };
    this.allQuestions().filter = JSON.stringify(this.filtre());
  }

  setMancheChoisie($event: ManchesEnum) {
    if (this.currentFiltreType() !== this.bloquageManche.get($event)) {
      this.mancheChoisie.set($event);
      this.allQuestions().filter = JSON.stringify(this.filtre());
      this.arreterMusique();
    }
  }

  getRowspan(question: QuestionExtended): number {
    if (question.ordre === 1) {
      return this.mancheChoisie() === ManchesEnum.COMPET ? 12 : 6;
    }
    return 1;
  }

  ecouterMusique(musique: string) {
    this.musiqueEnEcoute = musique;
    this.extraitEnEcoute = new Audio(`/assets/extraits/${this.musiqueEnEcoute}.mp3`);
    this.extraitEnEcoute.play();
  }

  arreterMusique() {
    if (this.extraitEnEcoute) {
      this.extraitEnEcoute.pause();
      this.extraitEnEcoute.currentTime = 0;
      this.musiqueEnEcoute = '';
      this.extraitEnEcoute = null;
    }
  }

  getStringAliases(aliases: string[]) {
    return aliases?.join(', ');
  }

  updateFiltreType(typeFiltre: FiltreQuestionType | null) {
    this.currentFiltreType.set(typeFiltre);
  }

  updateFiltre(filtre: {
    typeFiltre: FiltreQuestionType;
    value: Partie | number | boolean | string;
  }) {
    this.filterPartie.set(null);
    this.filterTheme.set(null);
    this.filterMusique.set(null);
    this.filterTexte.set('');
    switch (filtre.typeFiltre) {
      case FiltreQuestionType.PARTIE:
        this.filterPartie.set(filtre.value as Partie);
        break;
      case FiltreQuestionType.THEME:
        this.filterTheme.set(filtre.value as number);
        break;
      case FiltreQuestionType.MUSIQUE:
        this.filterMusique.set(filtre.value as boolean);
        break;
      case FiltreQuestionType.TEXTE:
        this.filterTexte.set(filtre.value as string);
        break;
    }

    this.allQuestions().filter = JSON.stringify(this.filtre());
  }

  openEditQuestionDialog(question: QuestionExtended) {
    const dialogRef = this.openAddEditQuestionDialog.open(AddEditQuestionDialogComponent, {
      data: {
        question: question,
      },
      width: '75vw',
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        tap((questionUpdated) => {
          if (questionUpdated) {
            this.allQuestions().data = questionUpdated;
            this.allQuestions().filter = JSON.stringify(this.filtre());
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.arreterMusique();
  }
}
