import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiProperty({ type: String, example: '' })
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class GetRolesDto {
  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String, example: '' })
  @IsOptional()
  @IsString()
  description?: string;
}
