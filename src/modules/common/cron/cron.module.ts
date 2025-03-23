import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DeactivateInactiveUsersCronModule } from './deactivate-inactive-users/deactivate-inactive-users.module';

@Module({
  imports: [ScheduleModule.forRoot(), DeactivateInactiveUsersCronModule],
})
export class CronModule {}
