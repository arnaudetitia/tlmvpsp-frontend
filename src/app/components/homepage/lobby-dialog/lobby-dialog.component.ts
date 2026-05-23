import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { JoueursStore } from '../../../store/joueurs.store';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HomepageComponent } from '../homepage.component';

@Component({
  selector: 'app-lobby-dialog',
  imports: [
    MatDialogModule,
    MatDialogTitle,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: 'lobby-dialog.component.html',
  styleUrl: './lobby-dialog.component.scss',
})
export class LobbyDialogComponent {
  readonly dialogRef = inject(MatDialogRef<HomepageComponent>);

  nomJoueurs: string[] = ['Alice', 'Bernard', 'Camille', 'Dimitri', 'Eleonore', 'François'];

  joueurListForm: FormGroup;

  listeJoueurCompleted: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.joueurListForm = this.formBuilder.group({
      joueur1: ['', [Validators.required]],
      joueur2: ['', [Validators.required]],
      joueur3: ['', [Validators.required]],
      joueur4: ['', [Validators.required]],
      joueur5: ['', [Validators.required]],
      joueur6: ['', [Validators.required]],
    });
  }

  lancerPartie() {
    localStorage.clear();
    const listeJoueurs = Object.entries(this.joueurListForm.value).map(
      (joueurField) => joueurField[1] as string,
    );
    this.dialogRef.close(listeJoueurs);
  }
}
