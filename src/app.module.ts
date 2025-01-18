import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigurations } from './config/app.config';
import { joiValidationSchema } from './config/joi.validation';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfigurations],
      validationSchema: joiValidationSchema,
    }),
    
    MongooseModule.forRoot(process.env.MONGODB),

    AuthModule,



  
  ],
  
})
export class AppModule {
  
}
