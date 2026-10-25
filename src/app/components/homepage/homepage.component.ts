import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LobbyDialogComponent } from './lobby-dialog/lobby-dialog.component';
import { Router, RouterLink } from '@angular/router';
import { JoueursStore } from '../../store/joueurs.store';
import { PartieStore } from '../../store/partie.store';
import { HealthStore } from '../../store/health.store';
import { tap } from 'rxjs';

@Component({
  selector: 'app-homepage.component',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements OnInit {
  lancerPartieDialog = inject(MatDialog);

  backendAwake = signal<boolean>(false);

  constructor(
    private router: Router,
    private healthStore: HealthStore,
    private partieStore: PartieStore,
    private joueursStore: JoueursStore,
  ) {}

  ngOnInit(): void {
    this.healthStore.backendAwake$
      .pipe(
        tap(() => {
          this.backendAwake.set(true);
        }),
      )
      .subscribe();
  }

  openLobby() {
    const dialogRef = this.lancerPartieDialog.open(LobbyDialogComponent, {
      width: '50vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((nouvellePartie) => {
      if (nouvellePartie) {
        const { listeJoueurs, idPartie } = nouvellePartie;
        this.joueursStore.setJoueursQualifs(listeJoueurs);
        this.partieStore.setPartieEnCours(idPartie);
        this.router.navigate(['/qualifs']);
      }
    });
  }
}
