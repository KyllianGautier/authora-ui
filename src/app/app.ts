import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlowyBackground } from './shared/components/glowy-background/glowy-background';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlowyBackground],
  template: `
    <app-glowy-background>
      <router-outlet />
    </app-glowy-background>
  `,
})
export class App {}
