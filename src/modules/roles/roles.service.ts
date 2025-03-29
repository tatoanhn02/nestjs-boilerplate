import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { escapeRegex } from '../../shared/helpers/data.helper';
import { DEFAULT_SORT } from '../../shared/helpers/mongo.helper';
import { PaginationHeaderHelper } from '../../shared/helpers/pagination.helper';
import {
  IPagination,
  IPaginationResponse,
} from '../../shared/interfaces/pagination.interface';
import { CreateRoleDto, GetRolesDto, UpdateRoleDto } from './roles.dto';
import { RoleRepository } from './roles.repository';
import { Role, RoleDocument } from './roles.schema';

@Injectable()
export class RolesService {
  constructor(
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly roleRepository: RoleRepository,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleDocument> {
    const existingRole = await this.roleRepository.findOne({
      name: createRoleDto.name,
    });

    if (existingRole) {
      throw new BadRequestException(
        `Role name ${createRoleDto.name} already exists.`,
      );
    }

    return this.roleRepository.create(createRoleDto);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return this.roleRepository.updateById(id, updateRoleDto);
  }

  async getRoles(
    filters: GetRolesDto,
    pagination: IPagination,
  ): Promise<IPaginationResponse<Role>> {
    const sort = DEFAULT_SORT;
    const findParams = this.buildFindParams(filters);

    const [roles, rolesCount] = await Promise.all([
      this.roleRepository.find(findParams, {
        ...(pagination && { skip: pagination.startIndex }),
        ...(pagination && { limit: pagination.perPage }),
        sort,
      }),
      this.roleRepository.count(findParams),
    ]);

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      rolesCount,
    );

    return { headers: responseHeaders, items: roles };
  }

  async readRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }

  async deleteRole(id: string): Promise<void> {
    await this.roleRepository.deleteById(id);
  }

  private buildFindParams(filters: GetRolesDto): Record<string, any> {
    return {
      ...(filters?.name && {
        name: { $regex: escapeRegex(filters.name), $options: 'i' },
      }),
      ...(filters?.description && {
        description: {
          $regex: escapeRegex(filters.description),
          $options: 'i',
        },
      }),
    };
  }
}
