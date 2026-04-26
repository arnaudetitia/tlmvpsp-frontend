import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Compet, JoueurCompet, QuestionCompet } from '../models/compet.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompetService {
  constructor(private http: HttpClient) {}

  getCompet(): Observable<Compet> {
    return this.http.get<Compet>(environment.apiUrl + '/compet/questions');
  }

  getJoueursCompet(): Observable<JoueurCompet[]> {
    return this.http.get<JoueurCompet[]>(environment.apiUrl + '/compet/joueurs');
  }

  setJoueursCompet(joueursCompet: string[]): Observable<any> {
    return this.http.post(environment.apiUrl + '/compet/joueurs', { joueursCompet });
  }

  setQuestionToRemote(question: string, reponsesDisplay: string[]) {
    return this.http.post(environment.apiUrl + '/compet/question/current', {
      question,
      reponsesDisplay,
    });
  }

  openVotes() {
    return this.http.put(environment.apiUrl + '/compet/open-votes', {});
  }

  closeVotes() {
    return this.http.put(environment.apiUrl + '/compet/close-votes', {});
  }

  freezeVotes() {
    return this.http.put(environment.apiUrl + '/compet/freeze-votes', {});
  }
}
