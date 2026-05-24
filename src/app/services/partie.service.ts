import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Partie } from '../models/partie.model';

@Injectable({
  providedIn: 'root',
})
export class PartieService {
  constructor(private http: HttpClient) {}
  getAllParties() {
    return this.http.get<Partie[]>(environment.apiUrl + '/parties');
  }
}
