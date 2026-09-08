import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users//users.module.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn:'1d'},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
