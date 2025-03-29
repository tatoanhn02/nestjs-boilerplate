import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import ms from 'ms';

import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  USER_LOCK_DURATION_MINUTES,
  USER_MAX_FAILED_ATTEMPTS,
} from '../../config/config.provider';
import { Errors } from '../../errors/errors.constants';
import { UpdateFailedAttempts } from '../users/users.dto';
import { UserDocument } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { AuthLoginDto, LoginResponseDto, TokenData } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateLogin(loginDto: AuthLoginDto): Promise<UserDocument> {
    const user = await this.usersService.findUserByEmail(loginDto.email);

    if (!user) {
      throw new HttpException(Errors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (user.isLocked && user.lockUntil && new Date() < user.lockUntil) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message:
            'Account is locked due to multiple failed login attempts. Try again later.',
          errorCode: 'LOCKED',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      const failedAttempts = user.failedAttempts + 1;

      const failedData: UpdateFailedAttempts = { failedAttempts };

      if (failedAttempts >= USER_MAX_FAILED_ATTEMPTS) {
        failedData.isLocked = true;
        failedData.lockUntil = new Date(
          Date.now() + USER_LOCK_DURATION_MINUTES * 60 * 1000,
        );
      }
      await this.usersService.updateFailedAttempts(user.id, failedData);

      throw new HttpException(Errors.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    if (user.failedAttempts > 0) {
      await this.usersService.resetFailedAttempts(user.id);
    }

    return user;
  }

  async login(user: UserDocument): Promise<LoginResponseDto> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      hash,
      id: user.id,
      isAdmin: true,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
      userEmail: user.email,
    };
  }

  private async getTokensData(data: TokenData) {
    const tokenExpires = Date.now() + ms(JWT_EXPIRES_IN);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          isAdmin: data.isAdmin,
        },
        {
          expiresIn: JWT_EXPIRES_IN,
          secret: JWT_SECRET,
        },
      ),
      await this.jwtService.signAsync(
        {
          hash: data.hash,
        },
        {
          expiresIn: JWT_REFRESH_EXPIRES_IN,
          secret: JWT_REFRESH_SECRET,
        },
      ),
    ]);

    return { token, refreshToken, tokenExpires };
  }
}
