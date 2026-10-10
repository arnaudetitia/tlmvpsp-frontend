export class EtatPartieUtil {
  static ADMIN_PASSWORD = 'ADMIN_PASSWORD';

  static resetPartie() {
    const mdpAdmin = localStorage.getItem('ADMIN_PASSWORD');

    localStorage.clear();

    if (mdpAdmin) {
      localStorage.setItem(this.ADMIN_PASSWORD, mdpAdmin);
    }
  }
}
