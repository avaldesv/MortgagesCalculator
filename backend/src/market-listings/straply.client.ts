import { estimateMonthlyPayment } from './listing-estimate';
import { UsMarketListing } from './market-listings.types';

const STRAPLY_BASE = 'https://api.straply.com/v1';

export interface StraplyFetchParams {
  city: string;
  state: string;
  zipCode?: string;
  limit: number;
}

type StraplyPropertyRow = Record<string, unknown>;

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/[$,]/g, ''));
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function pickAddress(row: StraplyPropertyRow): {
  line?: string;
  city?: string;
  state?: string;
  zip?: string;
} {
  const addr = row.address;
  if (addr && typeof addr === 'object') {
    const a = addr as Record<string, unknown>;
    return {
      line:
        asString(a.line1) ??
        asString(a.streetAddress) ??
        asString(a.full) ??
        asString(a.formatted),
      city: asString(a.city),
      state: asString(a.state) ?? asString(a.stateCode),
      zip: asString(a.zipCode) ?? asString(a.zip),
    };
  }
  return {
    line: asString(row.addressLine) ?? asString(row.streetAddress) ?? asString(row.formattedAddress),
    city: asString(row.city),
    state: asString(row.state) ?? asString(row.stateCode),
    zip: asString(row.zipCode) ?? asString(row.zip),
  };
}

function listingUrlFor(row: StraplyPropertyRow, addressLine: string): string {
  const direct =
    asString(row.listingUrl) ??
    asString(row.url) ??
    asString(row.propertyUrl) ??
    asString(row.detailUrl);
  if (direct) return direct;
  const q = encodeURIComponent(`${addressLine} home for sale`);
  return `https://www.google.com/search?q=${q}`;
}

function isForSaleListing(row: StraplyPropertyRow): boolean {
  const status = (asString(row.status) ?? '').toLowerCase();
  return status === 'forsale' || status === 'for_sale';
}

export function mapStraplyRow(row: StraplyPropertyRow): UsMarketListing | null {
  if (!isForSaleListing(row)) return null;

  const id = asString(row.id) ?? asString(row.propertyId) ?? asString(row.parcelId);
  const price =
    asNumber(row.listPrice) ??
    asNumber(row.price) ??
    asNumber(row.currentListPrice) ??
    asNumber(row.lastListPrice);
  if (!id || price == null || price <= 0) return null;

  const addr = pickAddress(row);
  const city = addr.city ?? '';
  const state = (addr.state ?? '').toUpperCase().slice(0, 2);
  const zipCode = addr.zip ?? '';
  const addressLine =
    addr.line ??
    ([city, state, zipCode].filter((p) => p && String(p).trim()).join(', ') || `${city}, ${state}`);

  return {
    id: `sl-${id}`,
    price,
    city,
    state,
    zipCode,
    addressLine,
    bedrooms:
      asNumber(row.bedroomsTotal) ?? asNumber(row.bedrooms) ?? asNumber(row.beds) ?? 0,
    bathrooms:
      asNumber(row.bathroomsTotal) ??
      asNumber(row.bathrooms) ??
      asNumber(row.baths) ??
      0,
    squareFeet:
      asNumber(row.squareFeet) ??
      asNumber(row.sqft) ??
      asNumber(row.livingArea) ??
      asNumber(row.squareFootage) ??
      0,
    estimatedMonthlyPayment: Math.round(estimateMonthlyPayment(price)),
    listingUrl: listingUrlFor(row, addressLine),
    imageUrl: asString(row.imageUrl) ?? asString(row.photoUrl) ?? asString(row.primaryPhotoUrl),
    daysOnMarket: asNumber(row.daysOnMarket) ?? asNumber(row.dom),
    propertyType: asString(row.propertyType) ?? asString(row.type),
  };
}

function extractRows(json: unknown): StraplyPropertyRow[] {
  if (Array.isArray(json)) return json as StraplyPropertyRow[];
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    for (const key of ['data', 'properties', 'results', 'items']) {
      if (Array.isArray(o[key])) return o[key] as StraplyPropertyRow[];
    }
  }
  return [];
}

export async function fetchStraplyProperties(
  apiKey: string,
  params: StraplyFetchParams,
): Promise<UsMarketListing[]> {
  const zip = params.zipCode?.trim();
  if (!zip) {
    throw new Error('Straply requires zipCode (city+state alone may fail on Straply API)');
  }

  const url = new URL(`${STRAPLY_BASE}/properties`);
  url.searchParams.set('zipCode', zip);
  const limit = Math.min(12, Math.max(1, params.limit));
  const fetchLimit = Math.min(50, limit * 8);
  url.searchParams.set('limit', String(fetchLimit));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Straply ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as unknown;
  return extractRows(json)
    .map(mapStraplyRow)
    .filter((x): x is UsMarketListing => x != null)
    .slice(0, limit);
}
