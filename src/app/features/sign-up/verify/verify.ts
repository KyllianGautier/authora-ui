import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';

@Component({
  selector: 'app-verify',
  imports: [
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatProgressSpinnerModule,
    MatIcon,
  ],
  templateUrl: './verify.html',
  styleUrl: './verify.scss',
})
export class Verify implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly redirectService = inject(RedirectService);
  private readonly transloco = inject(TranslocoService);

  readonly status = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit(): void {
    this.redirectService.init();

    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.status.set('error');
      return;
    }

    this.api.verifyEmail(email, token).subscribe({
      next: () => {
        this.status.set('success');
        setTimeout(() => {
          const lang = this.transloco.getActiveLang();
          this.router.navigate(['/', lang, 'sign-in']);
        }, 1500);
      },
      error: () => {
        this.status.set('error');
      },
    });
  }
}
