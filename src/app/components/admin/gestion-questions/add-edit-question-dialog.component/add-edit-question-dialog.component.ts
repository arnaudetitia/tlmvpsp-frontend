import { Component, effect, inject, Inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QuestionExtended } from '../../../../models/question.model';
import { TriTypeEnum } from '../../../../models/enums/tri.enum';
import { MatIconModule } from '@angular/material/icon';
import { ManchesEnum } from '../../../../models/enums/manches.enum';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-edit-question-dialog.component',
  imports: [
    MatDialogModule,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-edit-question-dialog.component.html',
  styleUrl: './add-edit-question-dialog.component.scss',
})
export class AddEditQuestionDialogComponent {
  questionForm: FormGroup;

  data = inject<{ question: QuestionExtended }>(MAT_DIALOG_DATA);

  TriTypeLabels = Object.values(TriTypeEnum).filter(
    (value) => typeof value === 'string',
  ) as string[];

  mayHaveAliases: boolean = false;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  aliases = signal<string[]>([]);

  constructor(private formBuilder: FormBuilder) {
    const questionToEdit = this.data.question;
    this.mayHaveAliases =
      questionToEdit.mancheQuestion === ManchesEnum.COMPET && [7, 8].includes(questionToEdit.ordre);
    this.aliases.set(questionToEdit.aliases || []);
    this.questionForm = this.formBuilder.group({
      question: [questionToEdit.question, [Validators.required]],
      bonneReponse: [questionToEdit.bonneReponse, [Validators.required]],
      mauvaisesReponses: this.formBuilder.array(
        (questionToEdit.mauvaisesReponses || []).map((rep: string) =>
          this.formBuilder.control(rep, Validators.required),
        ),
      ),
      tri: [questionToEdit.tri, [Validators.required]],
      musique: [questionToEdit.musique, []],
      joueeApresQuestion: [questionToEdit.joueeApresQuestion],
      aliases: [this.aliases(), []],
    });

    effect(() => {
      if (this.questionForm && this.questionForm.get('aliases')) {
        this.questionForm.patchValue({
          aliases: this.aliases(),
        });
      }
    });
  }

  get mauvaisesReponsesFormArray(): FormArray {
    return this.questionForm.get('mauvaisesReponses') as FormArray;
  }

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileName = file.name.replace('.mp3', '');
      this.questionForm.patchValue({
        musique: fileName,
      });
    }
  }

  addAlias(event: MatChipInputEvent) {
    const newAlias = (event.value || '').trim();

    if (newAlias) {
      this.aliases.update((aliases) => [...aliases, newAlias]);
    }

    event.chipInput!.clear();
  }

  removeAlias(alias: string) {
    const index = this.aliases().indexOf(alias);
    if (index > -1) {
      this.aliases.update((aliases) => aliases.filter((a) => a !== alias));
    }
  }

  addEditQuestion() {}
}
