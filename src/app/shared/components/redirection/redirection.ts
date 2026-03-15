import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../auth-layout/auth-layout';

const COUNTDOWN_SECONDS = 5;

@Component({
  selector: 'app-redirection',
  imports: [AuthLayout, AuthLayoutTitle, MatButton, MatIcon, MatProgressBar, TranslocoDirective],
  templateUrl: './redirection.html',
  styleUrl: './redirection.scss',
})
export class Redirection implements OnDestroy {
  private readonly router = inject(Router);
  private readonly navigation = this.router.getCurrentNavigation()?.extras.state ?? history.state;

  readonly title: string = this.navigation?.['title'] ?? '';
  readonly redirectTo: string = this.navigation?.['redirectTo'] ?? '';
  readonly message: string = this.navigation?.['message'] ?? '';

  readonly remaining = signal(COUNTDOWN_SECONDS);
  readonly progress = computed(
    () => ((COUNTDOWN_SECONDS - this.remaining()) / COUNTDOWN_SECONDS) * 100
  );

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (this.redirectTo) {
      this.intervalId = setInterval(() => {
        this.remaining.update((v) => v - 1);
        if (this.remaining() <= 0) {
          this.redirect();
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  redirect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.location.href = this.redirectTo;
  }
}
