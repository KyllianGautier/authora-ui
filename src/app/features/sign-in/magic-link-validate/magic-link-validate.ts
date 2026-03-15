import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';

@Component({
  selector: 'app-magic-link-validate',
  imports: [
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIcon,
    RouterLink,
  ],
  templateUrl: './magic-link-validate.html',
  styleUrl: './magic-link-validate.scss',
})
export class MagicLinkValidate implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly redirectService = inject(RedirectService);
  private readonly transloco = inject(TranslocoService);

  readonly status = signal<'loading' | 'success' | 'error' | 'expired'>('loading');

  ngOnInit(): void {
    this.redirectService.init();

    const sessionId = this.route.snapshot.queryParamMap.get('sessionId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!sessionId || !token) {
      this.status.set('error');
      return;
    }

    this.api.validateMagicLink(sessionId, token).subscribe({
      next: (result) => {
        this.status.set('success');
        setTimeout(() => {
          if (result.redirectUrl) {
            const url = new URL(result.redirectUrl);
            url.searchParams.set('exchangeToken', result.exchangeToken);
            window.location.href = url.toString();
          } else {
            this.redirectService.complete(
              this.transloco.translate('magicLinkValidate.successTitle'),
              this.transloco.translate('magicLinkValidate.successDescription'),
            );
          }
        }, 1500);
      },
      error: (err: { status: number }) => {
        this.status.set(err.status === 410 ? 'expired' : 'error');
      },
    });
  }
}
