import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request: Request) => {
                return request?.cookies?.jwt;
            },
        ]),
        secretOrKey: configService.get('JWT_SECRET'),
        passReqToCallback: true
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.authService.validateUser(id);
    return user;
  }
}