import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.authService.login(loginAuthDto);
    
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });

    return { user };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: User) {
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'Logout successful' };
  }
}