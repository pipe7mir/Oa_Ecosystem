import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { username, password } = loginDto;

    // Flexible field: if it contains @, it's an email, otherwise it's a username
    const isEmail = username.includes('@');
    const field = isEmail ? 'email' : 'username';

    const user = await this.usersRepo.findOne({ where: { [field]: username } });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'The provided credentials do not match our records.',
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'The provided credentials do not match our records.',
      });
    }

    if (!user.isApproved) {
      throw new ForbiddenException({
        success: false,
        message: 'Tu cuenta está pendiente de aprobación.',
      });
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already taken');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      name: dto.username,
      username: dto.username,
      email: dto.email,
      password: hashed,
      role: dto.role || 'user',
      isApproved: dto.role === 'admin', // Auto-approve admins
    });

    const saved = await this.usersRepo.save(user);

    return {
      success: true,
      message: 'Usuario registrado correctamente. Espera la aprobación de un administrador.',
      user: saved,
    };
  }
}
