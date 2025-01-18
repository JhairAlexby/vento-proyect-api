import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      // 1. Encrypt password
      const { password, ...userData } = createAuthDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Create user
      const user = await this.userModel.create({
        ...userData,
        password: hashedPassword
      });

      // 3. Return user (without password)
      const { password: _, ...result } = user.toJSON();
      return result;

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Username or email already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}