import type { Request } from 'express';

/** Client IP behind Railway / nginx (X-Forwarded-For, X-Real-IP). */
export function extractClientIp(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return normalizeIp(realIp.trim());
  if (req.socket?.remoteAddress) return normalizeIp(req.socket.remoteAddress);
  return undefined;
}

function normalizeIp(ip: string): string {
  return ip.replace(/^::ffff:/i, '');
}

export function isPrivateOrLocalIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const second = Number(ip.split('.')[1]);
    return second >= 16 && second <= 31;
  }
  return false;
}
