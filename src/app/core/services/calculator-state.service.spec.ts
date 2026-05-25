import { TestBed } from '@angular/core/testing';
import { DEFAULT_CALCULATOR_STATE } from '../models/calculator-state.model';
import { CalculatorStateService } from './calculator-state.service';

describe('CalculatorStateService', () => {
  let service: CalculatorStateService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorStateService);
  });

  it('patch updates snapshot fields', () => {
    service.patch({ homePrice: 500000, downPaymentAmount: 50_000 });
    const s = service.getSnapshot();
    expect(s.homePrice).toBe(500000);
    expect(s.downPaymentAmount).toBe(50_000);
    expect(s.loanAmount).toBe(450_000);
  });

  it('reset restores defaults', () => {
    service.patch({ homePrice: 1 });
    service.reset();
    expect(service.getSnapshot().homePrice).toBe(DEFAULT_CALCULATOR_STATE.homePrice);
  });

  it('persists to sessionStorage on patch', () => {
    service.patch({ zipCode: '32801' });
    const raw = sessionStorage.getItem('mortgagecalc_calculator_state_v2');
    expect(raw).toContain('32801');
  });
});
