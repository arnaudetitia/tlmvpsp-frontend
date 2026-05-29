import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { QuestionExtended } from '../models/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private http: HttpClient) {}
  getAllQuestions(): Observable<QuestionExtended[]> {
    return this.http.get<QuestionExtended[]>(environment.apiUrl + '/questions');
  }
}
