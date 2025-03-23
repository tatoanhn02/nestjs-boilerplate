import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../../../users/users.module';
import { UserRepository } from '../../../users/users.repository';
import { User, UserSchema } from '../../../users/users.schema';
import { CronjobLogRepository } from '../cronjob-logs/cronjob-logs.repository';
import {
  CronjobLog,
  CronjobLogSchema,
} from '../cronjob-logs/cronjob-logs.schema';
import { DeactivateInactiveUserService } from './deactivate-inactive-users.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CronjobLog.name, schema: CronjobLogSchema },
    ]),
  ],
  providers: [
    DeactivateInactiveUserService,
    UserRepository,
    CronjobLogRepository,
  ],
})
export class DeactivateInactiveUsersCronModule {}
