import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleModule } from './module/module.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URL || ''),
    ModuleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
