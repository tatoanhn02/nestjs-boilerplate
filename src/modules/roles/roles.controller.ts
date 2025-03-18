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
import { CreateRoleDto, GetRolesDto, UpdateRoleDto } from './roles.dto';
import { RolesService } from './roles.service';

@ApiTags(EApiTags.ROLE)
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('')
  @ApiOperation({
    operationId: 'indexRoles',
    description: 'to get roles',
  })
  @UseGuards()
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async indexRoles(
    @Query() filters: GetRolesDto,
    @Pagination() pagination: IPagination,
  ) {
    return this.rolesService.getRoles(filters, pagination);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'readRole',
    description: 'to read role',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async readRole(@Param('id') id: string) {
    return this.rolesService.readRole(id);
  }

  @Post('create')
  @ApiOperation({
    operationId: 'createRole',
    description: 'to create role',
  })
  @HttpCode(HttpStatus.OK)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Patch(':id/update')
  @ApiOperation({
    operationId: 'updateRole',
    description: 'to update role',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id/delete')
  @ApiOperation({
    operationId: 'deleteRole',
    description: 'to delete role',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
