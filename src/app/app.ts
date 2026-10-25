import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HealthService } from './services/health.service';
import { HealthStore } from './store/health.store';
import { tap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit, OnDestroy {
  pingInterval: any;

  constructor(
    private healthService: HealthService,
    private healthStore: HealthStore,
  ) {}

  ngOnInit(): void {
    this.pingBackend();

    this.pingInterval = setInterval(
      () => {
        this.pingBackend();
      },
      10 * 60 * 1000,
    );
  }

  pingBackend() {
    this.healthService
      .pingBackend()
      .pipe(
        tap(() => {
          this.healthStore.setBackendAwake();
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}
