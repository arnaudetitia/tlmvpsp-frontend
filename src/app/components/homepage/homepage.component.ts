import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LobbyDialogComponent } from './lobby-dialog/lobby-dialog.component';
import { Router } from '@angular/router';
import { JoueursStore } from '../../store/joueurs.store';

@Component({
  selector: 'app-homepage.component',
  imports: [MatButtonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  lancerPartieDialog = inject(MatDialog);

  constructor(
    private router: Router,
    private joueursStore: JoueursStore,
  ) {}

  openLobby() {
    const dialogRef = this.lancerPartieDialog.open(LobbyDialogComponent, {
      width: '50vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((joueurs) => {
      if (joueurs) {
        this.joueursStore.setJoueursQualifs(joueurs);
        this.router.navigate(['/qualifs']);
      }
    });
  }
}
