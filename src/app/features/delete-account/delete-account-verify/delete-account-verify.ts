import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';

@Component({
  selector: 'app-delete-account-verify',
  imports: [TranslocoDirective, AuthLayout, AuthLayoutTitle, MatProgressSpinnerModule, MatIcon],
  templateUrl: './delete-account-verify.html',
  styleUrl: './delete-account-verify.scss',
})
export class DeleteAccountVerify implements OnInit {
  private readonly route = inject(ActivatedRoute);
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

    this.api.verifyDeleteAccount(email, token).subscribe({
      next: () => {
        this.status.set('success');
        setTimeout(() => {
          this.redirectService.complete(
            this.transloco.translate('deleteAccountVerify.successTitle'),
            this.transloco.translate('deleteAccountVerify.successDescription'),
          );
        }, 1500);
      },
      error: () => {
        this.status.set('error');
      },
    });
  }
}
