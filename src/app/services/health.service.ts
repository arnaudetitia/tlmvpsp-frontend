import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private http: HttpClient) {}

  pingBackend() {
    return this.http.get(`${environment.apiUrl}/health`);
  }
}
