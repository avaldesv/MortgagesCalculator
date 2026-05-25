import { estimateMonthlyPayment } from './listing-estimate';
import { mapStraplyRow } from './straply.client';

describe('straply.client', () => {
  it('estimateMonthlyPayment returns positive P&I', () => {
    const p = estimateMonthlyPayment(400_000, 20, 7, 30);
    expect(p).toBeGreaterThan(2000);
    expect(p).toBeLessThan(3000);
  });

  it('mapStraplyRow maps property row', () => {
    const row = mapStraplyRow({
      id: 'abc',
      listPrice: 350000,
      status: 'forSale',
      address: { city: 'Orlando', state: 'FL', zipCode: '32801', line1: '100 Main St' },
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1500,
      daysOnMarket: 12,
    });
    expect(row?.id).toBe('sl-abc');
    expect(row?.estimatedMonthlyPayment).toBeGreaterThan(0);
    expect(row?.addressLine).toContain('Main');
  });

  it('mapStraplyRow skips rentals', () => {
    expect(mapStraplyRow({ id: 'x', price: 1, status: 'forRent' })).toBeNull();
  });
});
