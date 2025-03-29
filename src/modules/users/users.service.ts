import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Queue } from 'bull';

import { REDIS_QUEUE_USERS } from '../../config/config.provider';
import { escapeRegex } from '../../shared/helpers/data.helper';
import { DEFAULT_SORT } from '../../shared/helpers/mongo.helper';
import { PaginationHeaderHelper } from '../../shared/helpers/pagination.helper';
import {
  IPagination,
  IPaginationResponse,
} from '../../shared/interfaces/pagination.interface';
import { EAuthProviders } from '../auth/strategies/auth-providers.enum';
import { RoleRepository } from '../roles/roles.repository';
import { EQueueUserJobName } from './users.constants';
import {
  CreateBulkUsersDto,
  CreateUserDto,
  GetUsersDto,
  UpdateFailedAttempts,
  UpdateUserDto,
} from './users.dto';
import { EUserStatus } from './users.enum';
import { UserProfile } from './users.interface';
import { UserRepository } from './users.repository';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectQueue(REDIS_QUEUE_USERS) readonly queue: Queue,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument> {
    return this.userRepository.findOne({ email: email.toLowerCase().trim() });
  }

  async createBulkUsers(users: CreateBulkUsersDto) {
    await this.queue.add(EQueueUserJobName.CREATE_BULK_USERS, { users });

    return { status: 'PROCESSING', totalUsers: users.users.length };
  }

  async jobHandleCreateBulkUsers(usersPayload: CreateBulkUsersDto) {
    const createUsersPromise = usersPayload.users.map((user) =>
      this.createUser(user),
    );

    await Promise.all(createUsersPromise);
  }

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

  async readUser(id: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(id, { populate: 'role' });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.transformUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteById(id);
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

  private transformUser(user: UserDocument): UserProfile {
    const userProfile = new UserProfile();

    userProfile._id = user.id;
    userProfile.firstName = user.firstName;
    userProfile.lastName = user.lastName;
    userProfile.status = user.status;
    userProfile.email = user.email;
    userProfile.role = user.role.name;
    userProfile.provider = user.provider;

    return userProfile;
  }
}
