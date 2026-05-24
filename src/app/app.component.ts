import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent],
  template: `
    <div class="app-shell" data-concept="coastal-fintech">
      <app-site-header />
      <router-outlet />
      <footer class="site-footer">
        <p>
          © {{ year }} MortgageCalc · Estimates only, not a loan offer.
          Educational calculator — not a loan offer or financial advice.
        </p>
      </footer>
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly year = new Date().getFullYear();
}
