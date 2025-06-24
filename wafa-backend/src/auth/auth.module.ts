import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schemas';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY || 'defaultSecretKey',
      signOptions: { expiresIn: process.env.JWT_EXPIRED_DATE ||'1h' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
