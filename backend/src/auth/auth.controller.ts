import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Request } from 'express';

// Authentication Endpoints API
// POST /api/login, /api/register, /api/logout, GET /api/user
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    // With JWT there is no server-side session to destroy by default.
    // You can implement token blacklist if needed.
    return { message: 'Logged out successfully' };
  }

  // Get authenticated user data via JWT Token
  @Get('user')
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req: Request) {
    // En JwtStrategy.validate devolvemos { userId, role }
    return req.user;
  }
}
