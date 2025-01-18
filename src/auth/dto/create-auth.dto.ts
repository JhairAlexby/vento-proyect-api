import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../decorators/password.decorator';

export class CreateAuthDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  @IsStrongPassword({
    message: 'Password must be at least 6 characters long'
  })
  password: string;

  @IsEmail()
  email: string;
}
