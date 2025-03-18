import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EApiTags } from 'src/shared/enums/api-tags.enum';

import {
  ApiPagination,
  IPagination,
} from '../../shared/interfaces/pagination.interface';
import { Pagination } from '../../shared/validation-decorators/pagination.decorator';
import { CreateUserDto, GetUsersDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags(EApiTags.USER)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @ApiOperation({
    operationId: 'indexUsers',
    description: 'to get users',
  })
  @UseGuards()
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async indexUsers(
    @Query() filters: GetUsersDto,
    @Pagination() pagination: IPagination,
  ) {
    return this.usersService.getUsers(filters, pagination);
  }

  @Post('create')
  @ApiOperation({
    operationId: 'createUser',
    description: 'to create user',
  })
  @HttpCode(HttpStatus.OK)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}
