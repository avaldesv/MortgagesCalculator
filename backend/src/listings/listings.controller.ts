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
import { SponsoredListing } from '../store/data-store.service';
import { ListingsService } from './listings.service';

@Controller('api/v1/listings')
export class ListingsPublicController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  list(
    @Query('sponsored') sponsored: string,
    @Query('zip') zip?: string,
    @Query('maxPayment') maxPayment?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.listings.listPublic({
      sponsored,
      zip,
      maxPayment: maxPayment != null ? Number(maxPayment) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }
}

@Controller('api/v1/admin/listings')
@UseGuards(JwtAuthGuard)
export class ListingsAdminController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('active') active?: string,
  ) {
    return this.listings.listAdmin(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 50,
      active === undefined ? undefined : active === 'true',
    );
  }

  @Post()
  create(@Body() body: SponsoredListing) {
    return this.listings.create(body);
  }

  @Patch(':listingId')
  update(@Param('listingId') id: string, @Body() body: Partial<SponsoredListing>) {
    return this.listings.update(id, body);
  }

  @Delete(':listingId')
  @HttpCode(204)
  async remove(@Param('listingId') id: string): Promise<void> {
    await this.listings.remove(id);
  }
}
