import { 
  Controller, 
  Post, 
  Body, 
  Res, 
  Get, 
  UseGuards, 
  Patch, 
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return { message: 'Logout successful' };
  }

  // Obtener lista de usuarios (con paginación)
  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.authService.findAll(limit, offset);
  }

  // Obtener un usuario por ID
  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  // Actualizar usuario
  @Patch('users/:id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
    @GetUser() user: User,
  ) {
    return this.authService.update(id, updateAuthDto, user);
  }

  // Desactivar cuenta (soft delete)
  @Delete('users/:id/disable-account')
  @UseGuards(AuthGuard('jwt'))
  disableAccount(@Param('id') id: string, @GetUser() user: User) {
    return this.authService.disableAccount(id, user);
  }

  // Eliminación permanente de cuenta (hard delete)
  @Delete('users/:id/delete-account-permanently')
  @UseGuards(AuthGuard('jwt'))
  deleteAccountPermanently(@Param('id') id: string, @GetUser() user: User) {
    return this.authService.deleteAccountPermanently(id, user);
  }

  // Cambiar contraseña
  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Body() changePasswordDto: { oldPassword: string; newPassword: string },
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(changePasswordDto, user);
  }
}