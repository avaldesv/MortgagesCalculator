import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="admin-login card">
      <h1>Admin — MortgageCalc</h1>
      <p class="admin-login__hint">Manage ad placements and sponsored listings.</p>
      @if (error()) {
        <p class="admin-login__error" role="alert">{{ error() }}</p>
      }
      <form (submit)="onSubmit($event)">
        <label class="field">
          <span>Email</span>
          <input type="email" [(ngModel)]="email" name="email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input type="password" [(ngModel)]="password" name="password" required />
        </label>
        <button type="submit" class="btn btn--primary" [disabled]="loading()">Sign in</button>
      </form>
      <a routerLink="/simple-calculator" class="admin-login__back">← Back to site</a>
    </section>
  `,
  styles: `
    .admin-login {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1.5rem;
    }
    .admin-login__hint {
      color: var(--color-muted);
      margin-bottom: 1rem;
    }
    .admin-login__error {
      color: #b91c1c;
      margin-bottom: 0.75rem;
    }
    .admin-login__back {
      display: inline-block;
      margin-top: 1rem;
      font-size: 0.9rem;
    }
    .field {
      display: block;
      margin-bottom: 1rem;
    }
    .field span {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
    }
    .field input {
      width: 100%;
      padding: 0.5rem 0.65rem;
      border: 1px solid var(--color-border);
      border-radius: 6px;
    }
  `,
})
export class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  email = 'admin@mortgagecalc.app';
  password = 'changeme123';
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit(e: Event): void {
    e.preventDefault();
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid email or password.');
      },
    });
  }
}
