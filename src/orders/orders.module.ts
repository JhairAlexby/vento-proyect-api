import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './entities/order.entity';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: Order.name, 
        schema: OrderSchema 
      }
    ]),
    ProductsModule,
    AuthModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}