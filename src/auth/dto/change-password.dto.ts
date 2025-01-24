import { IsString } from 'class-validator';
import { IsStrongPassword } from '../decorators/password.decorator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @IsStrongPassword({
    message: 'New password must be at least 6 characters long'
  })
  newPassword: string;
}