import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminLoginComponent } from './features/admin/admin-login.component';
import { AdvancedCalculatorComponent } from './features/advanced-calculator/advanced-calculator.component';
import { AffordabilityCalculatorComponent } from './features/affordability-calculator/affordability-calculator.component';
import { CompareScenariosComponent } from './features/compare-scenarios/compare-scenarios.component';
import { SimpleCalculatorComponent } from './features/simple-calculator/simple-calculator.component';
import { HomesByPaymentComponent } from './features/homes-by-payment/homes-by-payment.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'simple-calculator' },
  { path: 'simple-calculator', component: SimpleCalculatorComponent },
  { path: 'advanced-calculator', component: AdvancedCalculatorComponent },
  { path: 'affordability', component: AffordabilityCalculatorComponent },
  { path: 'compare-scenarios', component: CompareScenariosComponent },
  { path: 'homes-by-payment', component: HomesByPaymentComponent },
  { path: 'learning-center', component: PlaceholderPageComponent, data: {
    tabId: 'learning-center',
    title: 'Learning Center',
    description: 'Mortgage guides and homebuying articles for U.S. buyers.',
  }},
  { path: 'partners', component: PlaceholderPageComponent, data: {
    tabId: 'partners',
    title: 'Advertise to Active Homebuyers',
    description: 'Partner with agents, lenders, and home service providers.',
  }},
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: 'simple-calculator' },
];
