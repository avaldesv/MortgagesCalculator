import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreatePartnerLeadDto, PartnerLeadsService } from './partner-leads.service';

@Controller('api/v1/leads')
export class PartnerLeadsController {
  constructor(private readonly leads: PartnerLeadsService) {}

  @Post('partner')
  @HttpCode(201)
  create(@Body() body: CreatePartnerLeadDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    return this.leads.create(body, ip);
  }
}
