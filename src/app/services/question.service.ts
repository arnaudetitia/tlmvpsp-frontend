import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { QuestionExtended, QuestionVo } from '../models/question.model';
import { ImporError } from '../models/import-errors.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private http: HttpClient) {}
  getAllQuestions(): Observable<QuestionExtended[]> {
    return this.http.get<QuestionExtended[]>(environment.apiUrl + '/questions');
  }

  addQuestion(newQuestion: QuestionVo, musicFile: File | null): Observable<QuestionExtended[]> {
    const formData = new FormData();
    formData.append('question', JSON.stringify(newQuestion));
    if (musicFile) {
      formData.append('musicFile', musicFile);
    }
    return this.http.post<QuestionExtended[]>(environment.apiUrl + '/questions', formData);
  }

  updateQuestion(
    idQuestion: number,
    question: QuestionVo,
    musicFile: File | null,
  ): Observable<QuestionExtended[]> {
    const formData = new FormData();
    formData.append('question', JSON.stringify(question));
    if (musicFile) {
      formData.append('musicFile', musicFile);
    }
    return this.http.put<QuestionExtended[]>(
      environment.apiUrl + '/questions/' + idQuestion,
      formData,
    );
  }

  checkImportQuestions(
    manche: string,
    csvFileContent: any,
  ): Observable<{ erreurs: ImporError[]; questions: QuestionExtended[] }> {
    return this.http.post<{ erreurs: ImporError[]; questions: QuestionExtended[] }>(
      environment.apiUrl + '/questions/import',
      {
        manche,
        csvFileContent,
        doImport: false,
      },
    );
  }

  importQuestions(
    manche: string,
    csvFileContent: any,
  ): Observable<{ erreurs: ImporError[]; questions: QuestionExtended[] }> {
    return this.http.post<{ erreurs: ImporError[]; questions: QuestionExtended[] }>(
      environment.apiUrl + '/questions/import',
      {
        manche,
        csvFileContent,
        doImport: true,
      },
    );
  }
}
