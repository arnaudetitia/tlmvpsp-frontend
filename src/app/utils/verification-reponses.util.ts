export class VerificationReponseUtils {
  static SCORE_MINIMUM = 85;
  static SCORE_MINIMUM_ALIAS = 90;

  static verifyReponse = (
    reponseDonnee: string,
    bonneReponse: string,
    aliases: string[],
  ): boolean => {
    return (
      this.getReponseSimilarity(reponseDonnee, bonneReponse) >= this.SCORE_MINIMUM ||
      (aliases &&
        aliases.some(
          (alias) => this.getReponseSimilarity(reponseDonnee, alias) >= this.SCORE_MINIMUM_ALIAS,
        ))
    );
  };

  static getReponseSimilarity = (reponseDonnee: string, bonneReponse: string): number => {
    const cleanReponseDonnee = this.cleanReponse(reponseDonnee);
    const cleanBonneReponse = this.cleanReponse(bonneReponse);
    if (cleanReponseDonnee === cleanBonneReponse) {
      return 100;
    }

    const bigramsReponseDonnee = this.getBigrams(cleanReponseDonnee);
    const bigramsBonneReponse = this.getBigrams(cleanBonneReponse);
    // On compare la liste des bigrammes
    // On compte le nombre de bigrames qui sont identiques et à la meme place
    let bigramsRestants = [...bigramsBonneReponse];
    let nbBigrammesSimilaires = 0;
    for (const bigramme of bigramsReponseDonnee) {
      const indexBigramme = bigramsRestants.indexOf(bigramme);

      if (indexBigramme !== -1) {
        nbBigrammesSimilaires++;
        bigramsRestants.splice(indexBigramme, 1);
      }
    }
    const scoreBigrammes =
      ((2 * nbBigrammesSimilaires) / (bigramsBonneReponse.length + bigramsReponseDonnee.length)) *
      100;
    // On Cherche maintenant à comparer les caractères de la réponse donnée et de la bonne réponse
    let nbCaracteresSimilaires = 0;
    const frequenceReponseonnee = this.getFrequenceCaracteres(cleanReponseDonnee);
    const frequenceBonneReponse = this.getFrequenceCaracteres(cleanBonneReponse);
    for (const char in frequenceReponseonnee) {
      if (frequenceBonneReponse[char]) {
        nbCaracteresSimilaires += Math.min(
          frequenceReponseonnee[char],
          frequenceBonneReponse[char],
        );
      }
    }
    const scoreCaracteres =
      (nbCaracteresSimilaires / Math.max(cleanBonneReponse.length, cleanReponseDonnee.length)) *
      100;
    return Math.round((scoreBigrammes + scoreCaracteres) / 2);
  };

  // Supprime les espace,les accents, les majuscules et les caractères spéciaux
  // Conserve les chiffres et les lettres
  static cleanReponse = (reponse: string): string => {
    return reponse
      .toLowerCase()
      .normalize('NFD')
      .replace(/\b(le|la|les|l'|un|une|des|du|de|d')\b/g, '')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  static getBigrams = (reponse: string): string[] => {
    const bigrams: string[] = [];
    for (let i = 0; i < reponse.length - 1; i++) {
      bigrams.push(reponse.substring(i, i + 2));
    }
    return bigrams;
  };

  static getFrequenceCaracteres = (reponse: string): { [key: string]: number } => {
    const frequence: { [key: string]: number } = {};
    for (const char of reponse) {
      if (frequence[char]) {
        frequence[char]++;
      } else {
        frequence[char] = 1;
      }
    }
    return frequence;
  };
}
