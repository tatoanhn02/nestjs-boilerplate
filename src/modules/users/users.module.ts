import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaginationHeaderHelper } from '../../shared/helpers/pagination.helper';
import { RoleRepository } from '../roles/roles.repository';
import { Role, RoleSchema } from '../roles/roles.schema';
import { UsersController } from './users.controller';
import { UsersQueue } from './users.queue';
import { UserRepository } from './users.repository';
import { User, UserSchema } from './users.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    PaginationHeaderHelper,
    UsersService,
    UserRepository,
    RoleRepository,
    UsersQueue,
  ],
  exports: [UsersService],
})
export class UsersModule {}
