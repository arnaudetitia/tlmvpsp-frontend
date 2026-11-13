import { Component, inject } from '@angular/core';
import { CompetComponent } from '../compet.component';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-code-dialog.component',
  imports: [MatDialogModule, MatDialogTitle, QRCodeComponent],
  templateUrl: './qr-code-dialog.component.html',
  styleUrl: './qr-code-dialog.component.scss',
})
export class QrCodeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CompetComponent>);

  urlRemote = 'https://tlmvpsp-remote.onrender.com/';
}
