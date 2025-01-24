import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('JwtStrategy');

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.jwt;
          this.logger.debug('Token from cookies:', token ? 'Present' : 'Not present');
          return token;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true
    });
  }

  async validate(request: Request, payload: any) {
    try {
      this.logger.debug('Validating JWT payload');

      if (!payload || !payload.id) {
        this.logger.error('Invalid payload structure');
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.authService.validateUser(payload.id);

      if (!user) {
        this.logger.error(`User not found for id: ${payload.id}`);
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('JWT validation error:', error?.message);
      throw new UnauthorizedException();
    }
  }
}