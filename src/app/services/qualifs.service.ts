import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { QuestionQualif } from '../models/qualifs.models';

@Injectable({
  providedIn: 'root',
})
export class QualifsService {
  constructor(private httpClient: HttpClient) {}

  getQuestionsQualifs(idPartie: number) {
    return this.httpClient.get<QuestionQualif[]>(environment.apiUrl + `/qualifs/${idPartie}`);
  }
}
