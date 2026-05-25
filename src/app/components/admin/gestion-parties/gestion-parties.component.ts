import { Component, inject, OnInit, signal } from '@angular/core';
import { PartieService } from '../../../services/partie.service';
import { Partie } from '../../../models/partie.model';
import { tap } from 'rxjs';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreationPartieDialogComponent } from './creation-partie-dialog.component/creation-partie-dialog.component';

@Component({
  selector: 'app-gestion-parties.component',
  imports: [
    BoutonRetourComponent,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatTableModule,
  ],
  templateUrl: './gestion-parties.component.html',
  styleUrl: './gestion-parties.component.scss',
})
export class GestionPartiesComponent implements OnInit {
  partieList = signal<Partie[]>([]);

  displayedColumns = ['nomPartie', 'qualifs', 'compet', 'defi'];

  openCreationDialog = inject(MatDialog);

  constructor(private partieService: PartieService) {}

  ngOnInit(): void {
    this.partieService
      .getAllParties()
      .pipe(
        tap((parties) => {
          this.partieList.set(parties);
        }),
      )
      .subscribe();
  }

  openCreationPartieDialog() {
    const dialogRef = this.openCreationDialog.open(CreationPartieDialogComponent, {
      width: '75vw',
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(
        tap((partieUpdated) => {
          if (partieUpdated) {
            this.partieList.set(partieUpdated);
          }
        }),
      )
      .subscribe();
  }
}
