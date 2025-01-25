import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @GetUser() user: User) {
    return this.salesService.create(createSaleDto, user);
  }

  @Get()
  findAll(@GetUser() user: User, 
          @Query('from') fromDate: string,
          @Query('to') toDate: string) {
    return this.salesService.findAll(user, fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.salesService.findOne(id, user);
  }  
}