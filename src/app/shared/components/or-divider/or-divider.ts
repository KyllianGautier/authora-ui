import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-or-divider',
  imports: [TranslocoDirective],
  template: `
    <div class="or-divider" *transloco="let t">
      <div class="line"></div>
      <span class="label">{{ t('orDivider.or') }}</span>
      <div class="line"></div>
    </div>
  `,
  styleUrl: './or-divider.scss',
})
export class OrDivider {}
