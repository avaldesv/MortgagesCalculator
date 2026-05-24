import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminLoginComponent } from './features/admin/admin-login.component';
import { SimpleCalculatorComponent } from './features/simple-calculator/simple-calculator.component';
import { HomesByPaymentComponent } from './features/homes-by-payment/homes-by-payment.component';
import { PlaceholderPageComponent } from './features/placeholder/placeholder-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'simple-calculator' },
  { path: 'simple-calculator', component: SimpleCalculatorComponent },
  { path: 'advanced-calculator', component: PlaceholderPageComponent, data: {
    tabId: 'advanced-calculator',
    title: 'Advanced Mortgage Calculator',
    description: 'Detailed amortization, extra payments, loan types, and export options.',
  }},
  { path: 'affordability', component: PlaceholderPageComponent, data: {
    tabId: 'affordability',
    title: 'How much house can I afford?',
    description: 'Affordability score, DTI, and comfortable payment range.',
  }},
  { path: 'compare-scenarios', component: PlaceholderPageComponent, data: {
    tabId: 'compare-scenarios',
    title: 'Compare Mortgage Scenarios',
    description: 'Side-by-side 15 vs 30 year, down payments, and rate comparisons.',
  }},
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
