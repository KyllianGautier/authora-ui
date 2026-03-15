import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RedirectService } from './redirect.service';

@Injectable({ providedIn: 'root' })
export class BackToPageService {
  private readonly router = inject(Router);
  private readonly redirectService = inject(RedirectService);

  private readonly stack = signal<string[]>([]);

  readonly canGoBack = computed(
    () => this.stack().length > 0 || !!this.redirectService.backTo()
  );

  /**
   * Push the current URL onto the stack before navigating away.
   */
  push(): void {
    this.stack.update((s) => [...s, this.router.url]);
  }

  /**
   * Clear the navigation stack and the external backTo.
   */
  clear(): void {
    this.stack.set([]);
    this.redirectService.clear();
  }

  /**
   * Navigate back to the last page in the stack,
   * or to the external backTo URL if the stack is empty.
   */
  back(): void {
    const current = this.stack();
    if (current.length > 0) {
      const last = current[current.length - 1];
      this.stack.update((s) => s.slice(0, -1));
      this.router.navigateByUrl(last);
    } else {
      const backTo = this.redirectService.backTo();
      if (backTo) {
        window.location.href = backTo;
      }
    }
  }
}
