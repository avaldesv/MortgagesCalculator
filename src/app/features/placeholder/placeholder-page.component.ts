import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';
import type { TabId } from '../../core/models/tab.model';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [ModularPageComponent, RouterLink],
  template: `
    <app-modular-page [tabId]="tabId" [monthlyPayment]="2850">
      <section class="card placeholder">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <p class="placeholder__note">Full experience coming soon. Use Simple Calculator for now.</p>
        <a class="btn btn--primary" routerLink="/simple-calculator">Go to Simple Calculator</a>
      </section>
    </app-modular-page>
  `,
  styles: [
    `
      .placeholder h1 {
        margin: 0 0 0.5rem;
      }
      .placeholder p {
        color: var(--color-muted);
        line-height: 1.5;
      }
      .placeholder__note {
        margin: 1rem 0;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly tabId = this.route.snapshot.data['tabId'] as TabId;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
}
