import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { TokenBlacklistService } from './token-blacklist.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private tokenBlacklistService: TokenBlacklistService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Akses ditolak!');
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Format token salah!');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (payload.jti && await this.tokenBlacklistService.isBlacklisted(payload.jti)) {
        throw new UnauthorizedException('Token sudah tidak valid!');
      }

      try {
        await this.usersService.findOne(payload.sub);
      } catch {
        throw new UnauthorizedException('Akun tidak ditemukan atau sudah dihapus!');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Token palsu atau kadaluarsa!');
    }
  }
}
