import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JWT_EXPIRES_IN, JWT_SECRET } from '../../config/config.provider';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.trategy';

@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
    PassportModule.register({ defaultStrategy: undefined }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
