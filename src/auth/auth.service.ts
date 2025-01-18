import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
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

  private getJwtToken(payload: JwtPayload): string {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      this.logger.error('Error generating JWT token', error);
      throw new InternalServerErrorException('Error during login process');
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