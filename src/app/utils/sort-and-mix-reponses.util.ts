import { ModeQuestion } from '../models/mode-question.models';
import { TriTypeEnum } from '../models/tri.enum';

export class SortAndMixReponsesUtils {
  static trierReponses(
    reponses: string[],
    modeQuestionSelected: ModeQuestion | null,
    modeTri: TriTypeEnum | undefined,
  ): string[] {
    if (modeQuestionSelected === ModeQuestion.Cash) return [];
    const reponsesToSort =
      modeQuestionSelected === ModeQuestion.Duo
        ? SortAndMixReponsesUtils.seletionReponseDuo(reponses[0], reponses.slice(1))
        : reponses;
    switch (modeTri) {
      case TriTypeEnum.NUMERIQUE:
        return reponsesToSort.sort((reponseA, reponseB) => {
          const valeurA = SortAndMixReponsesUtils.cleanNumber(reponseA);
          const valeurB = SortAndMixReponsesUtils.cleanNumber(reponseB);
          return valeurA - valeurB;
        });

      case TriTypeEnum.DATE:
        return reponsesToSort.sort((reponseA, reponseB) => {
          const dateA = SortAndMixReponsesUtils.cleanDate(reponseA);
          const dateB = SortAndMixReponsesUtils.cleanDate(reponseB);
          return dateA - dateB;
        });
      default:
        return SortAndMixReponsesUtils.melangerReponses(reponsesToSort);
    }
  }

  static melangerReponses(reponses: string[]) {
    for (let i = reponses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reponses[i], reponses[j]] = [reponses[j], reponses[i]];
    }
    return reponses;
  }

  static seletionReponseDuo(bonneReponse: string, mauvaisesReponses: string[]): string[] {
    return [bonneReponse, mauvaisesReponses[Math.floor(Math.random() * mauvaisesReponses.length)]];
  }

  static cleanNumber(reponse: string): number {
    const texte = reponse.toUpperCase().trim();

    // Cas des chiffres romains
    const romainsMatch = texte.match(/[IVXLCDM]{2,}/);
    if (romainsMatch) {
      const decimal = SortAndMixReponsesUtils.romanToDecimal(romainsMatch[0]);
      if (decimal > 0) return decimal;
    }

    // Cas des chiffres normaux
    return Number.parseInt(reponse.replace(/\D/g, ''));
  }

  static romanToDecimal(roman: string): number {
    const romanValues: { [key: string]: number } = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };

    let decimal = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = romanValues[roman[i]];
      const next = romanValues[roman[i + 1]];

      if (next && current < next) {
        decimal -= current;
      } else {
        decimal += current;
      }
    }

    return decimal;
  }

  static cleanDate(reponse: string): number {
    const mois = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    const texte = reponse.toLowerCase().trim();
    let moisNum = 0;
    let jour = 0;

    for (let i = 0; i < mois.length; i++) {
      if (texte.includes(mois[i])) {
        moisNum = i + 1;
        break;
      }
    }

    const nombreMatch = texte.match(/\d+/);
    if (nombreMatch) {
      jour = parseInt(nombreMatch[0]);
    }

    return jour > 0 ? jour * 100 + moisNum : moisNum;
  }
}
