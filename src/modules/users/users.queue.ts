import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { REDIS_QUEUE_USERS } from '../../config/config.provider';
import { BaseQueue } from '../../shared/helpers/queue.helper';
import { EQueueUserJobName } from './users.constants';
import { CreateBulkUsersDto } from './users.dto';
import { UsersService } from './users.service';

const redisQueueUsers = REDIS_QUEUE_USERS;

@Processor(redisQueueUsers)
export class UsersQueue extends BaseQueue {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Process({ name: EQueueUserJobName.CREATE_BULK_USERS })
  async disabledUsers(
    job: Job<{
      batchId?: string;
      users: CreateBulkUsersDto;
    }>,
  ) {
    const { users } = job.data;
    await this.usersService.jobHandleCreateBulkUsers(users);
  }
}
