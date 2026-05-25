import { Component, OnInit, signal } from '@angular/core';
import { PartieService } from '../../../services/partie.service';
import { Partie } from '../../../models/partie.model';
import { tap } from 'rxjs';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-gestion-parties.component',
  imports: [BoutonRetourComponent, MatGridListModule, MatTableModule],
  templateUrl: './gestion-parties.component.html',
  styleUrl: './gestion-parties.component.scss',
})
export class GestionPartiesComponent implements OnInit {
  partieList = signal<Partie[]>([]);

  displayedColumns = ['nomPartie', 'qualifs', 'compet', 'defi'];

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
}
