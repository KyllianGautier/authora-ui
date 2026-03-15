import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslocoService } from '@jsverse/transloco';

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-lang-switcher',
  imports: [MatButton, MatMenu, MatMenuItem, MatMenuTrigger],
  template: `
    <button mat-button [matMenuTriggerFor]="langMenu">
      {{ currentLang().toUpperCase() }}
    </button>
    <mat-menu #langMenu="matMenu">
      @for (lang of languages; track lang.code) {
        <button mat-menu-item (click)="switchLang(lang.code)">{{ lang.name }}</button>
      }
    </mat-menu>
  `,
})
export class LangSwitcher {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  protected readonly currentLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Francais' },
    { code: 'es', name: 'Espanol' },
    { code: 'de', name: 'Deutsch' },
  ];

  switchLang(lang: string): void {
    const urlSegments = this.router.url.split('/');
    urlSegments[1] = lang;
    this.router.navigateByUrl(urlSegments.join('/'));
  }
}
