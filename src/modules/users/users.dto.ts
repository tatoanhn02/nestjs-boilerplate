import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { EUserStatus } from './users.enum';

export class CreateUserDto {
  @ApiProperty({ type: String, example: 'test@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty()
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/,
    {
      message:
        'Password must include uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty()
  @IsString()
  role: string;
}

export class UpdateFailedAttempts {
  isLocked?: boolean;
  lockUntil?: Date;
  failedAttempts?: number;
}

export class GetUsersDto {
  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ type: String, enum: EUserStatus, example: '' })
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateBulkUsersDto {
  @ApiProperty({
    type: [CreateUserDto],
    isArray: true,
    description: 'users info to create',
    example: [
      {
        email: 'test@example.com',
        password: '',
        firstName: '',
        lastName: '',
        role: '',
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateUserDto)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  users: CreateUserDto[];
}
