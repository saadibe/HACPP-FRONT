import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    this.updateOrientation();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateOrientation();
  }

  private updateOrientation(): void {

    const isLandscape =
      window.innerWidth > window.innerHeight;

    document.body.classList.toggle(
      'landscape-mode',
      isLandscape
    );

    document.body.classList.toggle(
      'portrait-mode',
      !isLandscape
    );
  }
}