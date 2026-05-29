import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { QuestionService } from '../../../services/question.service';
import { QuestionExtended } from '../../../models/question.model';
import { tap } from 'rxjs';
import { ManchesEnum } from '../../../models/enums/manches.enum';
import { CapitalisationPipe } from '../../../pipes/capitalisation.pipe';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gestion-questions.component',
  imports: [CommonModule, BoutonRetourComponent, CapitalisationPipe, MatTableModule, MatIconModule],
  templateUrl: './gestion-questions.component.html',
  styleUrl: './gestion-questions.component.scss',
})
export class GestionQuestionsComponent implements OnInit, OnDestroy {
  allQuestions = signal(new MatTableDataSource<QuestionExtended>([]));

  MancheEnum = ManchesEnum;

  mancheChoisie = signal<ManchesEnum>(ManchesEnum.QUALIFS);

  displayedColumnsBase = ['question', 'bonneReponse', 'mauvaisesReponses', 'triReponse'];

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
    return newDisplayedColumn;
  });

  filtre = computed(() => {
    return {
      manche: this.mancheChoisie(),
    };
  });

  musiqueEnEcoute = '';
  extraitEnEcoute: HTMLAudioElement | null = null;

  constructor(private questionService: QuestionService) {}

  ngOnInit() {
    this.questionService
      .getAllQuestions()
      .pipe(
        tap((allQuestions) => {
          this.allQuestions().data = allQuestions.map((q) => {
            return {
              ...q,
              idTheme: Number(q.idTheme),
            };
          });
        }),
      )
      .subscribe();
    this.allQuestions().filterPredicate = (question: QuestionExtended, filtre: string) => {
      const filtreParsed = JSON.parse(filtre);
      return question.mancheQuestion === filtreParsed.manche;
    };
    this.allQuestions().filter = JSON.stringify(this.filtre());
  }

  setMancheChoisie($event: ManchesEnum) {
    this.mancheChoisie.set($event);
    this.allQuestions().filter = JSON.stringify(this.filtre());
    this.arreterMusique();
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

  ngOnDestroy() {
    this.arreterMusique();
  }
}
