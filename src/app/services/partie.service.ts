import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  LigneeChampion,
  Partie,
  QuestionQualifDesc,
  ThemeCompet,
  ThemeDefi,
} from '../models/partie.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PartieService {
  constructor(private http: HttpClient) {}
  getAllParties() {
    return this.http.get<Partie[]>(environment.apiUrl + '/parties');
  }

  getAllLigneeChampion(): Observable<LigneeChampion[]> {
    return this.http.get<LigneeChampion[]>(environment.apiUrl + '/parties/champions');
  }

  getAllQuestionsQualifs(): Observable<QuestionQualifDesc[]> {
    return this.http.get<QuestionQualifDesc[]>(environment.apiUrl + '/parties/qualifs');
  }

  getAllThemesCompet(): Observable<ThemeCompet[]> {
    return this.http.get<ThemeCompet[]>(environment.apiUrl + '/parties/compet');
  }

  getAllThemesDefi(): Observable<ThemeDefi[]> {
    return this.http.get<ThemeDefi[]>(environment.apiUrl + '/parties/defi');
  }

  postNouvellePartie(
    nomPartie: string,
    idChampion: number,
    idsQuestionsQualifs: number[],
    idThemeCompet: number,
    idsThemesDefi: number[],
  ): Observable<Partie[]> {
    return this.http.post<Partie[]>(environment.apiUrl + '/parties', {
      nomPartie,
      idChampion,
      idsQuestionsQualifs,
      idThemeCompet,
      idsThemesDefi,
    });
  }
}
