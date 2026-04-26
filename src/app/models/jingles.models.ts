export class Jingles {
  private static fileDirectory = '/assets/jingles';

  static sonChronoQualif: HTMLAudioElement = new Audio(`${this.fileDirectory}/chronoQualif.mp3`);
  static sonChronoCompet: HTMLAudioElement = new Audio(`${this.fileDirectory}/chronoCompet.mp3`);
  static sonChronoCompetLong: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/chronoCompetLong.mp3`,
  );
  static sonFinChronoCompet: HTMLAudioElement = new Audio(`assets/jingles/finChronoCompet.mp3`);
  static sonChronoDefi: HTMLAudioElement = new Audio(`${this.fileDirectory}/chronoQualif.mp3`);
  static selectionReponse: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/selectionReponse.mp3`,
  );

  static sonBonneReponse: HTMLAudioElement = new Audio(`${this.fileDirectory}/bonneReponse.mp3`);
  static sonMauvaiseReponse: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/mauvaiseReponse.mp3`,
  );

  static sonSelectionThemeChallenger: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/selectionReponse.mp3`,
  );
  static sonSelectionThemeChampion: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/bonneReponse.mp3`,
  );
  static sonNouveauChampion: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/nouveauChampion.mp3`,
  );
  static sonVictoireChampion: HTMLAudioElement = new Audio(
    `${this.fileDirectory}/victoireChampion.mp3`,
  );
}
