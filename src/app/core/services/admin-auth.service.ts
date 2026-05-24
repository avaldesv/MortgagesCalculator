import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'mortgagecalc_admin_token';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(this.readToken());

  readonly isLoggedIn = () => !!this.token();

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string; expiresIn: number; tokenType: string }>(
        `${environment.apiBaseUrl}/api/v1/auth/login`,
        { email, password },
      )
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          this.token.set(res.accessToken);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }

  getAuthHeaders(): Record<string, string> {
    const t = this.token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
