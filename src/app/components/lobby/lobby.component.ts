
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { debounceTime, distinctUntilChanged, map, Subject, Subscription, tap } from 'rxjs';
import { JoueursStore } from '../../store/joueurs.store';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-main-menu',
  imports: [
    MatGridListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
],
  templateUrl: 'lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit {
  nomJoueurs: string[] = ['Alice', 'Bernard', 'Camille', 'Dimitri', 'Eleonore', 'François'];

  joueurListForm: FormGroup;

  listeJoueurCompleted: boolean = false;

  constructor(
    private router: Router,
    private joueursStore: JoueursStore,
    private formBuilder: FormBuilder,
  ) {
    this.joueurListForm = this.formBuilder.group({
      joueur1: ['', [Validators.required]],
      joueur2: ['', [Validators.required]],
      joueur3: ['', [Validators.required]],
      joueur4: ['', [Validators.required]],
      joueur5: ['', [Validators.required]],
      joueur6: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    localStorage.clear();
  }

  onGoToQualifs() {
    const listeJoueurs = Object.entries(this.joueurListForm.value).map(
      (joueurField) => joueurField[1] as string,
    );
    this.joueursStore.setJoueursQualifs(listeJoueurs);
    this.router.navigate(['/qualifs']);
  }
}
