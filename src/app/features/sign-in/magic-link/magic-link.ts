import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BackToPageService } from '../../../core/services/back-to-page.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';

@Component({
  selector: 'app-magic-link',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './magic-link.html',
  styleUrl: './magic-link.scss',
})
export class MagicLink {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly backToPageService = inject(BackToPageService);
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly emailFC = new FormControl<string>(
    history.state?.['email'] ?? '',
    {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    },
  );

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.emailFC.invalid) {
      this.emailFC.markAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.requestMagicLink(
      this.emailFC.value,
      undefined,
      this.redirectService.redirectTo() ?? undefined,
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.backToPageService.clear();
        const lang = this.transloco.getActiveLang();
        this.router.navigate(['/', lang, 'confirmation'], {
          state: {
            title: this.transloco.translate('magicLink.successTitle'),
            message: this.transloco.translate('magicLink.successDescription'),
          },
        });
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(
          this.transloco.translate('magicLink.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
