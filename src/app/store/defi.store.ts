import { Injectable } from '@angular/core';
import { EtatDefi } from '../models/enums/etat-defi.enum';
import { BehaviorSubject, of } from 'rxjs';
import { EtatPartieKeys } from '../models/enums/etat-partie.enum';

@Injectable({
  providedIn: 'root',
})
export class DefiStore {
  etatDefi: EtatDefi = EtatDefi.CHOIX_THEME;

  etatDefiSource = new BehaviorSubject<EtatDefi>(EtatDefi.CHOIX_THEME);
  etatDefi$ = this.etatDefiSource.asObservable();

  passerEtatSuivant() {
    switch (this.etatDefi) {
      case EtatDefi.CHOIX_THEME:
        this.etatDefi = EtatDefi.DEFI_CHALLENGER;
        break;

      case EtatDefi.DEFI_CHALLENGER:
        this.etatDefi = EtatDefi.DEFI_CHAMPION;
        break;

      case EtatDefi.DEFI_CHAMPION:
        this.etatDefi = EtatDefi.VERIF_DEFI_CHALLENGER;
        break;

      case EtatDefi.VERIF_DEFI_CHALLENGER:
        this.etatDefi = EtatDefi.FIN_DEFI;
        break;
    }

    this.etatDefiSource.next(this.etatDefi);
    localStorage.setItem(EtatPartieKeys.ETAT_DEFI, this.etatDefi);
  }

  getEtatDefi() {
    const etatDefiStorage = localStorage.getItem(EtatPartieKeys.ETAT_DEFI) as EtatDefi | null;
    if (etatDefiStorage) {
      const etatDefi = Object.values(EtatDefi).find((etat) => etat === etatDefiStorage);
      this.etatDefi = etatDefi || EtatDefi.CHOIX_THEME;
    } else {
      this.etatDefi = EtatDefi.CHOIX_THEME;
    }
    this.etatDefiSource.next(this.etatDefi);
    return of(this.etatDefi);
  }
}
