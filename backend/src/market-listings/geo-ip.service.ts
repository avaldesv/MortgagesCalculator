import { Injectable } from '@nestjs/common';
import { isPrivateOrLocalIp } from './client-ip.util';

export interface UsGeoFromIp {
  zipCode: string;
  city?: string;
  state?: string;
  countryCode: string;
}

interface IpApiCoResponse {
  error?: boolean;
  reason?: string;
  country_code?: string;
  postal?: string;
  city?: string;
  region_code?: string;
}

const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class GeoIpService {
  private readonly cache = new Map<string, { geo: UsGeoFromIp | null; at: number }>();

  async resolveUsLocation(clientIp?: string): Promise<UsGeoFromIp | null> {
    if (process.env.GEOIP_DISABLED === 'true') return null;
    if (!clientIp || isPrivateOrLocalIp(clientIp)) return null;

    const cached = this.cache.get(clientIp);
    if (cached && Date.now() - cached.at < GEO_CACHE_TTL_MS) return cached.geo;

    const geo = await this.fetchIpApiCo(clientIp);
    this.cache.set(clientIp, { geo, at: Date.now() });
    return geo;
  }

  private async fetchIpApiCo(ip: string): Promise<UsGeoFromIp | null> {
    const token = process.env.IPAPI_CO_TOKEN?.trim();
    const url = token
      ? `https://ipapi.co/${encodeURIComponent(ip)}/json/?key=${encodeURIComponent(token)}`
      : `https://ipapi.co/${encodeURIComponent(ip)}/json/`;

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'MortgageCalc/1.0' },
      });
      if (res.status === 429) return null;
      if (!res.ok) return null;

      const data = (await res.json()) as IpApiCoResponse;
      if (data.error) return null;
      if (data.country_code !== 'US') return null;

      const zip = normalizeZip(data.postal);
      if (!zip) return null;

      return {
        zipCode: zip,
        city: data.city?.trim(),
        state: data.region_code?.trim().toUpperCase().slice(0, 2),
        countryCode: 'US',
      };
    } catch {
      return null;
    }
  }
}

function normalizeZip(postal?: string): string | null {
  if (!postal) return null;
  const digits = postal.replace(/\D/g, '').slice(0, 5);
  return digits.length === 5 ? digits : null;
}
