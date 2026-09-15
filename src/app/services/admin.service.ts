import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  checkAdmin(mdpAdmin: string) {
    return this.http.post<void>(environment.apiUrl + '/admin', {
      mdpAdmin,
    });
  }
}
