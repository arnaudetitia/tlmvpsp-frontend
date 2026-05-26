import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LobbyDialogComponent } from './lobby-dialog/lobby-dialog.component';
import { Router, RouterLink } from '@angular/router';
import { JoueursStore } from '../../store/joueurs.store';
import { PartieStore } from '../../store/partie.store';

@Component({
  selector: 'app-homepage.component',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  lancerPartieDialog = inject(MatDialog);

  constructor(
    private router: Router,
    private partieStore: PartieStore,
    private joueursStore: JoueursStore,
  ) {}

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
