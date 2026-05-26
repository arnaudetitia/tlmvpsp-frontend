import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bouton-retour',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './bouton-retour.component.html',
  styleUrl: './bouton-retour.component.scss',
})
export class BoutonRetourComponent {}
