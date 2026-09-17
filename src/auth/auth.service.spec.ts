import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { TokenBlacklistService } from './token-blacklist.service.js';
import { AuditLogService } from '../common/audit-log.service.js';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: vi.fn(),
    updateLoginAttempts: vi.fn(),
  };

  const mockJwtService = {
    signAsync: vi.fn(),
  };

  const mockRefreshTokenRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockTokenBlacklistService = {
    blacklist: vi.fn(),
    isBlacklisted: vi.fn(),
    cleanup: vi.fn(),
  };

  const mockAuditLogService = {
    log: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('harus berhasil login dan mengembalikan JWT token serta data user', async () => {
      const mockUser = {
        id: 1,
        name: 'Budi Niaga',
        email: 'budi@tokshop.com',
        password: '$2b$10$hashedpassword',
        role: 'customer',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('mock_jwt_token');
      mockRefreshTokenRepository.create.mockReturnValue({ id: 'uuid-1', tokenHash: 'hash' });
      mockRefreshTokenRepository.save.mockResolvedValue({ id: 'uuid-1' });

      const result = await service.login({
        email: 'budi@tokshop.com',
        password: 'password123',
      });

      expect(result.message).toBe('Login Berhasil!');
      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.refresh_token).toBeDefined();
      expect(result.user).toEqual({
        id: 1,
        name: 'Budi Niaga',
        email: 'budi@tokshop.com',
        role: 'customer',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          email: 'budi@tokshop.com',
          role: 'customer',
          jti: expect.any(String),
        }),
      );
    });

    it('harus melempar UnauthorizedException dan tetap memanggil bcrypt compare (mitigasi timing attack) jika user tidak ditemukan', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: 'unknown@tokshop.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        expect.stringContaining('$2b$10$'),
      );
    });

    it('harus melempar UnauthorizedException jika password salah', async () => {
      const mockUser = {
        id: 1,
        name: 'Budi Niaga',
        email: 'budi@tokshop.com',
        password: '$2b$10$hashedpassword',
        role: 'customer',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: 'budi@tokshop.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

