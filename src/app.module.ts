import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigurations } from './config/app.config';


@Module({
  imports: [

    ConfigModule.forRoot({
      load: [EnvConfigurations],
    }),
    
    UserModule,

    MongooseModule.forRoot(process.env.MONGODB),



  
  ],
  
})
export class AppModule {
  constructor(){
    console.log(process.env)
  }
}
