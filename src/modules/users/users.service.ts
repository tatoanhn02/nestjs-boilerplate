import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { escapeRegex } from '../../shared/helpers/data.helper';
import { DEFAULT_SORT } from '../../shared/helpers/mongo.helper';
import { PaginationHeaderHelper } from '../../shared/helpers/pagination.helper';
import {
  IPagination,
  IPaginationResponse,
} from '../../shared/interfaces/pagination.interface';
import { EAuthProviders } from '../auth/strategies/auth-providers.enum';
import { RoleRepository } from '../roles/roles.repository';
import {
  CreateUserDto,
  GetUsersDto,
  UpdateFailedAttempts,
  UpdateUserDto,
} from './users.dto';
import { EUserStatus } from './users.enum';
import { UserRepository } from './users.repository';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new BadRequestException(
        `User email ${createUserDto.email} already exists.`,
      );
    }

    const role = await this.roleRepository.findById(createUserDto.role);

    if (!role) {
      throw new NotFoundException(
        `User with role ${createUserDto.role} not found.`,
      );
    }

    const password = await this.generatePassword(createUserDto.password);
    const userPayload = {
      ...createUserDto,
      password,
      provider: EAuthProviders.EMAIL,
      status: EUserStatus.ACTIVE,
    };

    return this.userRepository.create(userPayload);
  }

  async resetFailedAttempts(userId: string) {
    return await this.userRepository.updateById(userId, {
      failedAttempts: 0,
      isLocked: false,
      lockUntil: null,
    });
  }

  async updateFailedAttempts(userId: string, failedData: UpdateFailedAttempts) {
    return await this.userRepository.updateById(userId, failedData);
  }

  async getUsers(
    filters: GetUsersDto,
    pagination: IPagination,
  ): Promise<IPaginationResponse<User>> {
    const sort = DEFAULT_SORT;

    const findParams = this.buildFindParams(filters);

    const [users, usersCount] = await Promise.all([
      this.userRepository.find(findParams, {
        ...(pagination?.startIndex && { skip: pagination.startIndex }),
        ...(pagination?.perPage && { limit: pagination.perPage }),
        sort,
      }),
      this.userRepository.count(findParams),
    ]);

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      usersCount,
    );

    return {
      headers: responseHeaders,
      items: users,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.userRepository.updateById(id, updateUserDto);
  }

  private async generatePassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  private buildFindParams(filters: GetUsersDto): Record<string, any> {
    return {
      ...(filters?.name && {
        name: { $regex: escapeRegex(filters.name), $options: 'i' },
      }),
      ...(filters?.name && {
        $or: [
          {
            firstName: {
              $regex: escapeRegex(filters.name),
              $options: 'i',
            },
          },
          {
            lastName: {
              $regex: escapeRegex(filters.name),
              $options: 'i',
            },
          },
        ],
      }),
    };
  }
}
