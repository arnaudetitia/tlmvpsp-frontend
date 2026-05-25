import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { GestionPartiesComponent } from '../gestion-parties.component';
import { PartieService } from '../../../../services/partie.service';
import {
  LigneeChampion,
  QuestionQualifDesc,
  ThemeCompet,
  ThemeDefi,
} from '../../../../models/partie.model';

import { catchError, combineLatest, of, tap } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-creation-partie.component',
  imports: [
    MatDialogModule,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './creation-partie-dialog.component.html',
  styleUrl: './creation-partie-dialog.component.scss',
})
export class CreationPartieDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<GestionPartiesComponent>);

  newPartieForm: FormGroup;

  ligneesChampion = signal<LigneeChampion[]>([]);
  questionQualifList = signal<QuestionQualifDesc[]>([]);
  themesCompet = signal<ThemeCompet[]>([]);
  themesDefiList = signal<ThemeDefi[]>([]);

  constructor(
    private partieService: PartieService,
    private formBuilder: FormBuilder,
  ) {
    this.newPartieForm = this.formBuilder.group({
      nomPartie: ['', [Validators.required]],
      ligneeChampion: ['', [Validators.required]],
      questionQualifs: ['', [Validators.required]],
      themeCompet: ['', [Validators.required]],
      themesDefi: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    combineLatest([
      this.partieService.getAllLigneeChampion(),
      this.partieService.getAllQuestionsQualifs(),
      this.partieService.getAllThemesCompet(),
      this.partieService.getAllThemesDefi(),
    ])
      .pipe(
        tap(([lignees, questionsQualifs, themesCompet, themesDefi]) => {
          this.ligneesChampion.set(lignees);
          this.questionQualifList.set(questionsQualifs);
          this.themesCompet.set(themesCompet);
          this.themesDefiList.set(themesDefi);
        }),
      )
      .subscribe();
  }
  selectRemainingQuestion() {
    const currentQuestionQualifValue = this.newPartieForm.get('questionQualifs')?.value;
    const idsQuestionSelected: number[] = currentQuestionQualifValue.map((idQuestion: string) =>
      Number(idQuestion),
    );
    const nbQuestionSelected = idsQuestionSelected.length;
    const maxIdQuestion = Math.max(...idsQuestionSelected);
    const idQuestionsToSelect = this.questionQualifList()
      .filter((question) => question.id > maxIdQuestion)
      .slice(0, 12 - nbQuestionSelected)
      .map((question) => question.id);
    this.newPartieForm
      .get('questionQualifs')
      ?.setValue([...idsQuestionSelected, ...idQuestionsToSelect]);
  }

  creerNouvellePartie() {
    this.partieService
      .postNouvellePartie(
        this.newPartieForm.get('nomPartie')?.value,
        this.newPartieForm.get('ligneeChampion')?.value,
        this.newPartieForm.get('questionQualifs')?.value,
        this.newPartieForm.get('themeCompet')?.value,
        this.newPartieForm.get('themesDefi')?.value,
      )
      .pipe(
        tap((partieUpdated) => {
          this.dialogRef.close(partieUpdated);
        }),
        catchError(() => {
          console.log('Erreur');
          return of();
        }),
      )
      .subscribe();
  }
}
