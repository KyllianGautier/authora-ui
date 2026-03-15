import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatButtonModule } from '@angular/material/button';
import { RedirectService } from '../../../core/services/redirect.service';
import { BackToPageService } from '../../../core/services/back-to-page.service';

@Component({
  selector: 'app-two-factor-recovery',
  imports: [
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatButtonModule,
  ],
  templateUrl: './two-factor-recovery.html',
  styleUrl: './two-factor-recovery.scss',
})
export class TwoFactorRecovery {
  private readonly router = inject(Router);
  private readonly redirectService = inject(RedirectService);
  private readonly backToPageService = inject(BackToPageService);
  private readonly transloco = inject(TranslocoService);

  private readonly navigation = this.router.getCurrentNavigation()?.extras.state ?? history.state;
  readonly recoveryCodes: string[] = this.navigation?.['recoveryCodes'] ?? [];

  onDone(): void {
    this.backToPageService.clear();
    this.redirectService.complete(
      this.transloco.translate('mfaSetup.successTitle'),
      this.transloco.translate('mfaSetup.successDescription'),
    );
  }
}
