import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataStoreService, PartnerLead } from '../store/data-store.service';

const SERVICE_TYPES = new Set([
  'real_estate_agent',
  'mortgage_broker',
  'mortgage_lender',
  'insurance',
  'moving',
  'home_warranty',
  'solar',
  'internet',
  'title',
  'home_inspector',
  'other',
]);

export interface CreatePartnerLeadDto {
  name: string;
  company: string;
  email: string;
  phone: string;
  serviceType: string;
  targetRegion: string;
  monthlyBudget?: number;
  message?: string;
  consentContact: boolean;
}

@Injectable()
export class PartnerLeadsService {
  private readonly hits = new Map<string, { count: number; windowStart: number }>();

  constructor(private readonly store: DataStoreService) {}

  create(dto: CreatePartnerLeadDto, clientIp: string): { id: string; status: 'received'; createdAt: string } {
    this.enforceRateLimit(clientIp);
    this.validate(dto);

    const lead: PartnerLead = {
      id: `lead-${randomUUID().slice(0, 8)}`,
      ...dto,
      createdAt: new Date().toISOString(),
    };
    this.store.addPartnerLead(lead);
    return { id: lead.id, status: 'received', createdAt: lead.createdAt };
  }

  private validate(dto: CreatePartnerLeadDto): void {
    if (!dto.consentContact) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'consentContact must be true',
      });
    }
    if (!SERVICE_TYPES.has(dto.serviceType)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid serviceType',
      });
    }
    const required = ['name', 'company', 'email', 'phone', 'targetRegion'] as const;
    for (const key of required) {
      if (!dto[key]?.trim()) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: `${key} is required`,
        });
      }
    }
  }

  private enforceRateLimit(clientIp: string): void {
    const key = clientIp || 'unknown';
    const now = Date.now();
    const windowMs = 60_000;
    const max = 10;
    const entry = this.hits.get(key);
    if (!entry || now - entry.windowStart >= windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return;
    }
    entry.count += 1;
    if (entry.count > max) {
      throw new HttpException(
        {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retryAfter: Math.ceil((windowMs - (now - entry.windowStart)) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
