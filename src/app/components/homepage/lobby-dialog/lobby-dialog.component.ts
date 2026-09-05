import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HomepageComponent } from '../homepage.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { PartieService } from '../../../services/partie.service';
import { Partie } from '../../../models/partie.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-lobby-dialog',
  imports: [
    MatDialogModule,
    MatDialogTitle,
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
  ],
  templateUrl: 'lobby-dialog.component.html',
  styleUrl: './lobby-dialog.component.scss',
})
export class LobbyDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<HomepageComponent>);

  nomJoueurs: string[] = ['Alice', 'Bernard', 'Camille', 'Dimitri', 'Eleonore', 'François'];

  partieForm: FormGroup;

  listeJoueurCompleted: boolean = false;

  listeParties: Partie[] = [];

  constructor(
    private partieService: PartieService,
    private formBuilder: FormBuilder,
  ) {
    this.partieForm = this.formBuilder.group({
      joueur1: ['', [Validators.required]],
      joueur2: ['', [Validators.required]],
      joueur3: ['', [Validators.required]],
      joueur4: ['', [Validators.required]],
      joueur5: ['', [Validators.required]],
      joueur6: ['', [Validators.required]],
      idPartie: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.partieService
      .getAllParties()
      .pipe(
        tap((parties) => {
          this.listeParties = parties;
        }),
      )
      .subscribe();
  }

  lancerPartie() {
    localStorage.clear();
    const listeJoueurs = Object.entries(this.partieForm.value)
      .filter((field) => field[0].includes('joueur'))
      .map((joueurField) => joueurField[1] as string);
    const idPartie = this.partieForm.value.idPartie as number;
    this.partieService
      .flagPartieEnCours(idPartie)
      .pipe(
        tap(() => {
          this.dialogRef.close({ listeJoueurs, idPartie });
        }),
      )
      .subscribe();
  }
}
