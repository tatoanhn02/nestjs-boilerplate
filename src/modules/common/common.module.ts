import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';

import { REDIS, REDIS_QUEUE_USERS } from '../../config/config.provider';
import { CronModule } from './cron/cron.module';

const queueModule = BullModule.registerQueue({
  name: REDIS_QUEUE_USERS,
  prefix: '{usersQueue}',
  defaultJobOptions: {
    attempts: 0,
  },
  redis: REDIS,
});

@Global()
@Module({
  imports: [CronModule, queueModule],
  exports: [queueModule],
})
export class CommonModule {}
