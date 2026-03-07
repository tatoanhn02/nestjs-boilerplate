import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_SECRET } from '../../../config/config.provider';
import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: JwtPayloadType): JwtPayloadType {
    if (!payload.id) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
