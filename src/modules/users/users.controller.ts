import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { EApiTags } from 'src/shared/enums/api-tags.enum';

import {
  ApiPagination,
  IPagination,
} from '../../shared/interfaces/pagination.interface';
import { Pagination } from '../../shared/validation-decorators/pagination.decorator';
import {
  CreateBulkUsersDto,
  CreateUserDto,
  GetUsersDto,
  UpdateUserDto,
} from './users.dto';
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

  @Patch(':id/update')
  @ApiOperation({
    operationId: 'updateUser',
    description: 'to update user',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id/delete')
  @ApiOperation({
    operationId: 'deleteUser',
    description: 'to delete user',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('create-bulk-users')
  async createBulkUsers(@Body() createBulkUsersDto: CreateBulkUsersDto) {
    return this.usersService.createBulkUsers(createBulkUsersDto);
  }
}
