import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { debounceTime, distinctUntilChanged, map, Subject, Subscription, tap } from 'rxjs';
import { JoueursStore } from '../../store/joueurs.store';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-main-menu',
  imports: [CommonModule, MatGridListModule, MatButtonModule, FormsModule],
  templateUrl: 'lobby.component.html',
  styleUrl: './lobby.component.scss',
})
export class LobbyComponent implements OnInit, OnDestroy {
  nomJoueurs: string[] = ['Alice', 'Bernard', 'Camille', 'Dimitri', 'Eleonore', 'François'];

  private inputJoueurSubject = new Subject<string[]>();
  private inputJoueurSubcription: Subscription = new Subscription();

  listeJoueurCompleted: boolean = false;

  constructor(
    private router: Router,
    private joueursStore: JoueursStore,
  ) {}

  ngOnInit(): void {
    localStorage.clear();
    this.inputJoueurSubcription = this.inputJoueurSubject
      .pipe(
        debounceTime(500),
        map((noms) => noms.every((nom) => nom && nom.length > 0)),
        distinctUntilChanged(),
        tap((isComplete) => {
          this.listeJoueurCompleted = isComplete;
        }),
      )
      .subscribe();
  }

  onJoueurValueChanged() {
    this.inputJoueurSubject.next([...this.nomJoueurs]);
  }

  onGoToQualifs() {
    this.joueursStore.setJoueursQualifs(this.nomJoueurs);
    this.router.navigate(['/qualifs']);
  }

  ngOnDestroy(): void {
    this.inputJoueurSubcription.unsubscribe();
  }
}
