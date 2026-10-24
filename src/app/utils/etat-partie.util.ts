export class EtatPartieUtil {
  static ALREADY_LOGGED = 'ALREADY_LOGGED';
  static EXPIRATION_DATE = 'EXPIRATION_DATE';

  static resetPartie() {
    const mdpAdmin = localStorage.getItem(this.ALREADY_LOGGED);
    const expirationDate = localStorage.getItem(this.EXPIRATION_DATE);

    localStorage.clear();

    if (mdpAdmin) {
      localStorage.setItem(this.ALREADY_LOGGED, 'true');
      localStorage.setItem(this.EXPIRATION_DATE, expirationDate || '');
    }
  }
}
