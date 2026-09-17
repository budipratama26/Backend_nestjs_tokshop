import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Repository } from 'typeorm';
import { TokenBlacklistService } from './token-blacklist.service.js';
import { AuditLogService } from '../common/audit-log.service.js';

const DUMMY_HASH =
  '$2b$10$e8wV5q3QZ.j89uO7xN2Dqe4QeXmE5NqO4mHl1KxN4UeB7gHqC8W2q';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private tokenBlacklistService: TokenBlacklistService,
    private auditLogService: AuditLogService,
  ) { }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
  private async createRefreshToken(userId: number): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: { id: userId },
    });
    await this.refreshTokenRepository.save(refreshToken);
    return rawToken;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      await bcrypt.compare(loginDto.password, DUMMY_HASH);
      throw new UnauthorizedException('Akun terkunci sementara. Coba lagi nanti',);
    }

    const passwordToCompare = user ? user.password : DUMMY_HASH;

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      passwordToCompare,
    );

    if (!user || !isPasswordValid) {
      if (user) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await this.usersService.updateLoginAttempts(
          user.id,
          user.failedLoginAttempts,
          user.lockedUntil,
        );
      }
      await this.auditLogService.log({
          action: 'LOGIN_FAILED',
          userId: user?.id ?? null,
          details: {
            email: loginDto.email
          },
        });
        
      throw new UnauthorizedException('Email atau password salah!');
    }
    if (user.failedLoginAttempts > 0) {
      await this.usersService.updateLoginAttempts(user.id, 0, null);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    };

    const access_token = await this.jwtService.signAsync(payload);

    await this.auditLogService.log({
      action: 'LOGIN',
      userId: user.id,
      details: { email: user.email },
    });

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      message: 'Login Berhasil!',
      access_token: access_token,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  async refresh(oldRawToken: string) {
    const tokenHash = this.hashToken(oldRawToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token tidak valid!');
    }
    if (storedToken.isRevoked) {
      await this.refreshTokenRepository.update({
        user: { id: storedToken.user.id }
      },
        { isRevoked: true },
      );
      throw new UnauthorizedException('Refresh token reuse terdeteksi! semua sesi telah di-revoke');
    }
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token sudah kadaluarsa!');
    }
    storedToken.isRevoked = true;

    const payload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      jti: randomUUID(),
    };
    const newAccessToken = await this.jwtService.signAsync(payload);
    const newRawRefreshToken = randomBytes(32).toString('hex');
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const newRefreshToken = this.refreshTokenRepository.create({
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: { id: storedToken.user.id },
    })
    await this.refreshTokenRepository.save(newRefreshToken);
    storedToken.replacedByTokenId = newRefreshToken.id;
    await this.refreshTokenRepository.save(storedToken);
    return {
      message: 'Token berhasil di refresh!',
      access_token: newAccessToken,
      refresh_token: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken: string, jti?: string, exp?: number) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });
    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
    if (jti && exp) {
      await this.tokenBlacklistService.blacklist(jti, new Date(exp * 1000));
    }
    await this.auditLogService.log({
      action: 'LOGOUT',
      userId: undefined,
      details: { jti },
    });

    return { message: 'Logout berhasil!' };
  }
  async revokeAllforUser(userId: number, jti?: string, exp?: number) {
    await this.refreshTokenRepository.update({
      user: { id: userId }
    },
      { isRevoked: true },
    );
    if (jti && exp) {
      await this.tokenBlacklistService.blacklist(jti, new Date(exp * 1000));
    }
    await this.auditLogService.log({
      action: 'REVOKE_ALL_SESSIONS',
      userId: userId,
    });
  }
}
