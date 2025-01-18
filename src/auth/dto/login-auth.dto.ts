import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '../decorators/password.decorator';

export class LoginAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword({
    message: 'Password must be at least 6 characters long'
  })
  password: string;
}