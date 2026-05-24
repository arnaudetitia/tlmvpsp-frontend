import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ThemeDefi } from '../models/theme-defi.model';
import { Defi } from '../models/defi.model';

@Injectable({
  providedIn: 'root',
})
export class DefiService {
  constructor(private httpClient: HttpClient) {}

  getThemesDefi(idPartie: number): Observable<ThemeDefi[]> {
    return this.httpClient.get<ThemeDefi[]>(environment.apiUrl + `/defi/themes/${idPartie}`);
  }

  getDefiTheme(idTheme: number): Observable<Defi> {
    return this.httpClient.get<Defi>(environment.apiUrl + `/defi/questions/${idTheme}`);
  }

  getChampion(): Observable<string> {
    return this.httpClient.get<string>(environment.apiUrl + `/defi/champion`);
  }

  setNouveauChampion(idChampion: number, nomNouveauChampion: string) {
    return this.httpClient.put(environment.apiUrl + `/defi/champion/${idChampion}`, {
      newChampion: nomNouveauChampion,
    });
  }
}
