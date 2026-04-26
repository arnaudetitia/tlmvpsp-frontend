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

  getThemesDefi(): Observable<ThemeDefi[]> {
    return this.httpClient.get<ThemeDefi[]>(environment.apiUrl + '/defi/themes');
  }

  getDefiTheme(idTheme: number): Observable<Defi> {
    return this.httpClient.get<Defi>(environment.apiUrl + `/defi/questions/${idTheme}`);
  }

  getChampion(): Observable<string> {
    return this.httpClient.get<string>(environment.apiUrl + `/defi/champion`);
  }
}
