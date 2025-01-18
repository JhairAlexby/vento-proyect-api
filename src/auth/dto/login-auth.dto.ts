import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, {
    message: 'Please provide a valid email address'
  })
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character'
  })
  password: string;
}