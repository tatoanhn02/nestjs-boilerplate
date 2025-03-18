import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PaginationHeaderHelper } from '../../shared/helpers/pagination.helper';
import { RolesController } from './roles.controller';
import { RoleRepository } from './roles.repository';
import { Role, RoleSchema } from './roles.schema';
import { RolesService } from './roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RolesController],
  providers: [PaginationHeaderHelper, RolesService, RoleRepository],
})
export class RolesModule {}
