import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
} from '@angular/core';
import { PanneauJoueur, StatutJoueur } from '../../models/score.model';
import { JoueursStore } from '../../store/joueurs.store';
import { tap } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { VerificationReponseUtils } from '../../utils/verification-reponses.util';
import { CodeTouches } from '../../models/enums/code-touches.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ScoresStore } from '../../store/scores.store';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'panneau-score-joueurs',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatInputModule, FormsModule],
  templateUrl: './panneau-score-joueurs.component.html',
  styleUrl: './panneau-score-joueurs.component.scss',
})
export class PanneauScoreJoueursComponent implements OnInit {
  @Input() panneaux = signal<PanneauJoueur[]>([]);

  @Input() bonneReponse: string | null | undefined;

  @Input() aliases: string[] = [];

  @Input() showBonneReopnseGiven: boolean = false;

  @Input() selectedJoueur: string | undefined;

  @Input() nbJoueurAQualifier: number = 4;

  @Output() onAllJoueursQualifies = new EventEmitter<string[]>();

  @Output() onBonneReponseGiven = new EventEmitter<string>();

  modeRegie: boolean = false;

  isEditJoueurName: boolean = false;

  constructor(
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private joueursStore: JoueursStore,
    private scoresStores: ScoresStore,
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
    this.panneaux.set(
      this.panneaux().map((panneau) => {
        if (panneau.joueur.localeCompare(joueur) === 0) {
          return {
            ...panneau,
            reponseJoueur: reponse,
            bonneReponseGiven: bonneReponseDonne,
          };
        }
        return panneau;
      }),
    );
    this.cdr.detectChanges();
    if (bonneReponseDonne) {
      this.onBonneReponseGiven.emit(joueur);
    }
  }

  changerScore(joueur: string, increment: number) {
    this.panneaux.set(
      this.panneaux().map((pan) => {
        if (pan.joueur === joueur) {
          return {
            ...pan,
            score: pan.score + increment,
          };
        }
        return pan;
      }),
    );
  }

  onJoueurNameFocus() {
    this.isEditJoueurName = true;
  }

  onJoueurNameBlur() {
    this.isEditJoueurName = false;
  }

  repecher(scoreJoueur: PanneauJoueur) {
    if (scoreJoueur.statut === StatutJoueur.BALLOTAGE) {
      this.panneaux.set(
        this.panneaux().map((s) => {
          if (s === scoreJoueur) {
            return { ...s, statut: StatutJoueur.QUALIFIE };
          }
          return s;
        }),
      );
    }

    const nbJoueursQualifie = this.panneaux().filter(
      (panneauJoueur) => panneauJoueur.statut === StatutJoueur.QUALIFIE,
    ).length;

    if (nbJoueursQualifie === this.nbJoueurAQualifier) {
      let joueursQualifies: string[] = [];
      this.panneaux.set(
        this.panneaux().map((panneauJoueur) => {
          if (panneauJoueur.statut !== StatutJoueur.QUALIFIE) {
            return { ...panneauJoueur, statut: StatutJoueur.ELIMINE };
          } else {
            joueursQualifies.push(panneauJoueur.joueur);
          }
          return panneauJoueur;
        }),
      );
      this.onAllJoueursQualifies.emit(joueursQualifies);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent($event: KeyboardEvent) {
    const canChangeScore = this.panneaux().every((pan) => !pan.reponseJoueur);
    if ($event.code === CodeTouches.buttonRCode && !this.isEditJoueurName && canChangeScore) {
      this.modeRegie = !this.modeRegie;
      if (!this.modeRegie) {
        this.scoresStores.setPanneauJoueurs(this.panneaux());
      }
    }

    $event.stopPropagation();
  }
}
