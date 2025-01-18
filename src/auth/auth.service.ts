import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtPayload, LoginResponse } from './interfaces/index';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const { password, ...userData } = createAuthDto;
      
      const user = new this.userModel({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
  
      await user.save();
      const userObject = user.toJSON();
      const { password: _, ...result } = userObject;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

       async login(loginAuthDto: LoginAuthDto): Promise<LoginResponse> {
      const { email, password } = loginAuthDto;
    
      const user = await this.userModel.findOne({ 
        email,
        isActive: true 
      });
    
      if (!user) {
        throw new UnauthorizedException('Credentials are not valid');
      }
    
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Credentials are not valid');
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
    const token = this.jwtService.sign(payload);
    return token;
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}