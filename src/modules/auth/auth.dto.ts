import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: '' })
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  refreshToken: string;
  token: string;
  tokenExpires: number;
  userEmail: string;
}

export class TokenData {
  id: string;
  isAdmin: boolean;
  hash: string;
}
