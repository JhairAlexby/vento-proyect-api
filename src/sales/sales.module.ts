import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale, SaleSchema } from './entities/sale.entity';
import { Order, OrderSchema } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Order.name, schema: OrderSchema }
    ]),
    OrdersModule,
    AuthModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}