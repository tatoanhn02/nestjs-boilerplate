import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { getMongooseConfig } from '../../config/config.provider';
import { CommonModule } from '../../modules/common/common.module';
import { RolesModule } from '../../modules/roles/roles.module';
import { UsersModule } from '../../modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        return getMongooseConfig();
      },
    }),
    UsersModule,
    RolesModule,
    CommonModule,
  ],
})
export class CreateInitialUserModule {}
