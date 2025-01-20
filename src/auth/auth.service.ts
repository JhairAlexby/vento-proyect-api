import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtPayload, LoginResponse } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const { password, email } = createAuthDto;

      // Check if email already exists
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }
      
      const user = new this.userModel({
        ...createAuthDto,
        password: bcrypt.hashSync(password, 10)
      });
  
      await user.save();
      const { password: _, ...result } = user.toJSON();
      
      return result;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginAuthDto: LoginAuthDto): Promise<LoginResponse> {
    const { email, password } = loginAuthDto;
  
    const user = await this.userModel.findOne({ 
      email,
      isActive: true 
    }).select('+password');
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    if (!bcrypt.compareSync(password, user.password)) {
      // Log failed login attempts if needed
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const { password: _, ...userData } = user.toJSON();
    
    return {
      user: {
        id: userData._id.toString(),
        username: userData.username,
        email: userData.email,
        isActive: userData.isActive
      },
      token: this.getJwtToken({ 
        id: userData._id.toString(),
        username: userData.username,
        email: userData.email 
      })
    };
  }

  async findAll(limit: number = 10, offset: number = 0) {
    try {
      const [total, users] = await Promise.all([
        this.userModel.countDocuments({ isActive: true }),
        this.userModel.find({ isActive: true })
          .select('-password')
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 })
      ]);

      return {
        total,
        users,
        offset,
        limit,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password');
      if (!user || !user.isActive) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async update(id: string, updateAuthDto: UpdateAuthDto, currentUser: User) {
    try {
      // Solo el propio usuario o un admin puede actualizar
      if (id !== currentUser.id.toString()) {
        throw new ForbiddenException('You can only update your own profile');
      }

      const user = await this.userModel.findById(id);
      if (!user || !user.isActive) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (updateAuthDto.email && updateAuthDto.email !== user.email) {
        // Verificar si el nuevo email ya existe
        const emailExists = await this.userModel.findOne({ 
          email: updateAuthDto.email,
          _id: { $ne: id }
        });
        if (emailExists) {
          throw new BadRequestException('Email already exists');
        }
      }

      if (updateAuthDto.username && updateAuthDto.username !== user.username) {
        // Verificar si el nuevo username ya existe
        const usernameExists = await this.userModel.findOne({
          username: updateAuthDto.username,
          _id: { $ne: id }
        });
        if (usernameExists) {
          throw new BadRequestException('Username already exists');
        }
      }

      // No permitir actualización de password por este método
      const { password, ...updateData } = updateAuthDto;

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      return updatedUser;

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string, currentUser: User) {
    try {
      // Solo el propio usuario puede desactivar su cuenta
      if (id !== currentUser.id.toString()) {
        throw new ForbiddenException('You can only deactivate your own account');
      }

      const user = await this.userModel.findById(id);
      if (!user || !user.isActive) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Soft delete
      await this.userModel.findByIdAndUpdate(id, { isActive: false });

      return { message: 'User deactivated successfully' };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async changePassword(changePasswordDto: { oldPassword: string; newPassword: string }, user: User) {
    try {
      const currentUser = await this.userModel.findById(user.id).select('+password');
      
      // Verificar contraseña actual
      if (!bcrypt.compareSync(changePasswordDto.oldPassword, currentUser.password)) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Actualizar contraseña
      const hashedPassword = bcrypt.hashSync(changePasswordDto.newPassword, 10);
      await this.userModel.findByIdAndUpdate(user.id, {
        password: hashedPassword
      });

      return { message: 'Password updated successfully' };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async validateUser(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }
      return user;
    } catch (error) {
      this.logger.error('Error validating user', error);
      throw new UnauthorizedException();
    }
  }

  private getJwtToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      this.logger.error('Error generating JWT token', error);
      throw new InternalServerErrorException('Error during login process');
    }
  }

  private handleDBErrors(error: any): never {
    this.logger.error(error);

    if (error.code === 11000) {
      throw new BadRequestException('Email already exists in the database');
    }

    if (error.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}