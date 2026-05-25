import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModularPageComponent } from '../../layout/modular-page/modular-page.component';

const SERVICE_OPTIONS = [
  { value: 'real_estate_agent', label: 'Real estate agent' },
  { value: 'mortgage_broker', label: 'Mortgage broker' },
  { value: 'mortgage_lender', label: 'Mortgage lender' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'moving', label: 'Moving' },
  { value: 'home_warranty', label: 'Home warranty' },
  { value: 'solar', label: 'Solar' },
  { value: 'internet', label: 'Internet' },
  { value: 'title', label: 'Title' },
  { value: 'home_inspector', label: 'Home inspector' },
  { value: 'other', label: 'Other' },
] as const;

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [FormsModule, ModularPageComponent],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss',
})
export class PartnersComponent {
  private readonly http = inject(HttpClient);

  readonly serviceOptions = SERVICE_OPTIONS;

  name = '';
  company = '';
  email = '';
  phone = '';
  serviceType = 'real_estate_agent';
  targetRegion = '';
  monthlyBudget: number | null = null;
  message = '';
  consentContact = false;

  readonly submitting = signal(false);
  readonly successId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    this.errorMessage.set(null);
    this.successId.set(null);
    if (!this.consentContact) {
      this.errorMessage.set('You must agree to be contacted.');
      return;
    }
    this.submitting.set(true);
    this.http
      .post<{ id: string; status: string; createdAt: string }>(
        `${environment.apiBaseUrl}/api/v1/leads/partner`,
        {
          name: this.name.trim(),
          company: this.company.trim(),
          email: this.email.trim(),
          phone: this.phone.trim(),
          serviceType: this.serviceType,
          targetRegion: this.targetRegion.trim(),
          monthlyBudget: this.monthlyBudget ?? undefined,
          message: this.message.trim() || undefined,
          consentContact: true,
        },
      )
      .subscribe({
        next: (res) => {
          this.successId.set(res.id);
          this.submitting.set(false);
          this.name = '';
          this.company = '';
          this.email = '';
          this.phone = '';
          this.targetRegion = '';
          this.message = '';
          this.monthlyBudget = null;
          this.consentContact = false;
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err.error?.message ?? 'Unable to submit. Please try again later.';
          this.errorMessage.set(msg);
        },
      });
  }
}
