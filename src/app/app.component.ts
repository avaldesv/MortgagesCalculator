import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SiteHeaderComponent],
  template: `
    <div class="app-shell" data-concept="coastal-fintech">
      <app-site-header />
      <router-outlet />
      <footer class="site-footer">
        <p>
          © {{ year }} MortgageCalc · Estimates only, not a loan offer.
          <a routerLink="/admin/login" class="site-footer__admin">Admin</a>
        </p>
      </footer>
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly year = new Date().getFullYear();
}
