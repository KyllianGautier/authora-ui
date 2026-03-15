import { Component } from '@angular/core';

@Component({
  selector: 'app-glowy-background',
  template: `
    <div class="glow glow-purple"></div>
    <div class="glow glow-orange"></div>
    <div class="glow glow-green"></div>
    <div class="glow glow-blue"></div>
    <div class="glow glow-pink"></div>
    <div class="glow glow-cyan"></div>
    <ng-content />
  `,
  styleUrl: './glowy-background.scss',
})
export class GlowyBackground {}
