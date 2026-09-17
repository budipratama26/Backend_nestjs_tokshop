import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module.js';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { BlacklistedToken } from './entities/blacklisted-token.entity.js';
import { TokenBlacklistService } from './token-blacklist.service.js';

@Global()
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken, BlacklistedToken]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenBlacklistService],
  exports: [AuthService, TokenBlacklistService],
})
export class AuthModule { }
