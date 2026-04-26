import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { JoueursStore } from '../../store/joueurs.store';
import { tap } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { VerificationReponseUtils } from '../../utils/verification-reponses.util';

@Component({
  selector: 'panneau-score-joueurs',
  imports: [CommonModule],
  templateUrl: './panneau-score-joueurs.component.html',
  styleUrl: './panneau-score-joueurs.component.scss',
})
export class PanneauScoreJoueursComponent implements OnInit {
  @Input() panneaux: PanneauJoueur[] = [];

  @Input() bonneReponse: string | null | undefined;

  @Input() aliases: string[] = [];

  @Input() showBonneReopnseGiven: boolean = false;

  @Input() selectedJoueur: string | undefined;

  @Input() nbJoueurAQualifier: number = 4;

  @Output() onAllJoueursQualifies = new EventEmitter<string[]>();

  @Output() onBonneReponseGiven = new EventEmitter<string>();

  constructor(
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private joueursStore: JoueursStore,
  ) {}

  ngOnInit(): void {
    this.joueursStore.reponseJoueur$
      .pipe(
        tap((reponseJoueur) => {
          this.updateResponse(reponseJoueur.joueur, reponseJoueur.reponse);
        }),
      )
      .subscribe();
  }

  updateResponse(joueur: string, reponse: string) {
    const bonneReponseDonne = VerificationReponseUtils.verifyReponse(
      reponse,
      this.bonneReponse ? this.bonneReponse : '',
      this.aliases,
    );
    this.panneaux = this.panneaux.map((panneau) => {
      if (panneau.joueur.localeCompare(joueur) === 0) {
        return {
          ...panneau,
          reponseJoueur: reponse,
          bonneReponseGiven: bonneReponseDonne,
        };
      }
      return panneau;
    });
    this.cdr.detectChanges();
    if (bonneReponseDonne) {
      this.onBonneReponseGiven.emit(joueur);
    }
  }

  repecher(scoreJoueur: PanneauJoueur) {
    if (scoreJoueur.statut === StatutJoueur.BALLOTAGE) {
      this.panneaux = this.panneaux.map((s) => {
        if (s === scoreJoueur) {
          return { ...s, statut: StatutJoueur.QUALIFIE };
        }
        return s;
      });
    }

    const nbJoueursQualifie = this.panneaux.filter(
      (panneauJoueur) => panneauJoueur.statut === StatutJoueur.QUALIFIE,
    ).length;

    if (nbJoueursQualifie === this.nbJoueurAQualifier) {
      let joueursQualifies: string[] = [];
      this.panneaux = this.panneaux.map((panneauJoueur) => {
        if (panneauJoueur.statut !== StatutJoueur.QUALIFIE) {
          return { ...panneauJoueur, statut: StatutJoueur.ELIMINE };
        } else {
          joueursQualifies.push(panneauJoueur.joueur);
        }
        return panneauJoueur;
      });
      this.onAllJoueursQualifies.emit(joueursQualifies);
    }
  }
}
