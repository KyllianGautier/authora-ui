import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class RedirectService {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  private readonly _redirectTo = signal<string | null>(null);
  private readonly _backTo = signal<string | null>(null);

  readonly redirectTo = this._redirectTo.asReadonly();
  readonly backTo = this._backTo.asReadonly();

  /**
   * Capture redirectTo and backTo from the current URL query params.
   * Should be called once on the entry page (sign-in, sign-up, etc.).
   */
  init(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const params = urlTree.queryParamMap;

    if (params.has('redirectTo')) {
      this._redirectTo.set(params.get('redirectTo'));
    }
    if (params.has('backTo')) {
      this._backTo.set(params.get('backTo'));
    }
  }

  /**
   * Clear the stored redirectTo and backTo values.
   */
  clear(): void {
    this._redirectTo.set(null);
    this._backTo.set(null);
  }

  /**
   * Navigate to the confirmation or redirection page at the end of a workflow.
   */
  complete(title: string, message: string): void {
    const lang = this.transloco.getActiveLang();
    const redirectTo = this._redirectTo();

    if (redirectTo) {
      this.router.navigate(['/', lang, 'redirect'], {
        state: { title, redirectTo, message },
      });
    } else {
      this.router.navigate(['/', lang, 'confirmation'], {
        state: { title, message },
      });
    }
  }
}
