import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigurations } from './config/app.config';
import { joiValidationSchema } from './config/joi.validation';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SalesModule } from './sales/sales.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfigurations],
      validationSchema: joiValidationSchema,
    }),
    
    MongooseModule.forRoot(process.env.MONGODB),

    AuthModule,

    ProductsModule,

    OrdersModule,

    SalesModule,



  
  ],
  
})
export class AppModule {
  
}
