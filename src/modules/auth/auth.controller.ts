import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { EApiTags } from '../../shared/enums/api-tags.enum';
import { AuthLoginDto, LoginResponseDto } from './auth.dto';
import { ILoginRequest } from './auth.interface';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags(EApiTags.AUTH)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    operationId: 'login',
    description: 'login via email, password',
  })
  @ApiBody({ type: AuthLoginDto })
  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  async login(@Req() req: ILoginRequest) {
    return this.authService.login(req.user);
  }
}
