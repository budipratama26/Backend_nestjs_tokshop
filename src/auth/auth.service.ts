import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';

const DUMMY_HASH = '$2b$10$e8wV5q3QZ.j89uO7xN2Dqe4QeXmE5NqO4mHl1KxN4UeB7gHqC8W2q'
@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    const passwordToCompare = user ? user.password : DUMMY_HASH;

    const isPasswordValid = await bcrypt.compare(loginDto.password, passwordToCompare);
    
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(`Email atau password salah!`);
    }
    
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login Berhasil!',
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}