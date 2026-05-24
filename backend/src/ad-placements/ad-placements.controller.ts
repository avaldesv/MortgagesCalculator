import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdPlacement } from '../store/data-store.service';
import { AdPlacementsService } from './ad-placements.service';

@Controller()
export class AdPlacementsPublicController {
  constructor(private readonly placements: AdPlacementsService) {}

  @Get('api/v1/ad-placements/active')
  getActive(@Query('tab') tab: string) {
    return this.placements.activeForTab(tab ?? '');
  }
}

@Controller('api/v1/admin/ad-placements')
@UseGuards(JwtAuthGuard)
export class AdPlacementsAdminController {
  constructor(private readonly placements: AdPlacementsService) {}

  @Get()
  list() {
    return { data: this.placements.listAll() };
  }

  @Get(':placementId')
  get(@Param('placementId') id: string) {
    return this.placements.getOne(id);
  }

  @Post()
  create(@Body() body: AdPlacement) {
    return this.placements.create(body);
  }

  @Patch(':placementId')
  update(@Param('placementId') id: string, @Body() body: Partial<AdPlacement>) {
    return this.placements.update(id, body);
  }

  @Delete(':placementId')
  @HttpCode(204)
  remove(@Param('placementId') id: string): void {
    this.placements.remove(id);
  }
}
