import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HealthStore {
  private backendAwake: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  backendAwake$ = this.backendAwake.asObservable();

  setBackendAwake() {
    this.backendAwake.next(true);
  }
}
