import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigurations } from './config/app.config';
import { joiValidationSchema } from './config/joi.validation';


@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfigurations],
      validationSchema: joiValidationSchema,
    }),
    
    UserModule,

    MongooseModule.forRoot(process.env.MONGODB),



  
  ],
  
})
export class AppModule {
  
}
