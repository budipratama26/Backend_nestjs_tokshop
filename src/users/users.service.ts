import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogService } from '../common/audit-log.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditLogService: AuditLogService,
  ) { }
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });
    if (existingUser) {
      throw new BadRequestException('Registrasi gagal, silahkan coba email lain');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    await this.usersRepository.save(newUser);

    await this.auditLogService.log({
      action: 'REGISTER',
      userId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    return {
      message: `Registrasi user berhasil!`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async findAll() {
    return await this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan!`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.failedLoginAttempts', 'user.lockedUntil'])
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    await this.usersRepository.save(updatedUser);
    return {
      message: `User berhasil diperbarui`,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
    await this.auditLogService.log({
      action: 'DELETE_ACCOUNT',
      userId: id,
    });
    return { message: `User dengan ID ${id} berhasil di hapus` };
  }
  async updateLoginAttempts(userId: number, attempts: number, lockedUntil: Date | null) {
    await this.usersRepository.update(userId, {
      failedLoginAttempts: attempts,
      lockedUntil: lockedUntil,
    });
  }
}
