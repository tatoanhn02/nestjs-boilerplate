import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { errorLog, infoLog } from '../../../../shared/helpers/logger.helper';
import { EUserStatus } from '../../../users/users.enum';
import { UserRepository } from '../../../users/users.repository';
import {
  ECronjobStatus,
  ECronjobType,
} from '../cronjob-logs/cronjob-logs.enum';
import { CronjobLogRepository } from '../cronjob-logs/cronjob-logs.repository';

@Injectable()
export class DeactivateInactiveUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cronjobLogRepository: CronjobLogRepository,
  ) {}

  @Cron('0 0 * * *', { name: ECronjobType.DEACTIVATE_INACTIVE_USERS })
  async deactivateInactiveUsers() {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const updateResult = await this.userRepository.updateMany(
        {
          status: EUserStatus.ACTIVE,
          $or: [
            { lastLogin: { $lt: ninetyDaysAgo } },
            { lastLogin: null, createdAt: { $lt: ninetyDaysAgo } },
          ],
        },
        {
          $set: { status: EUserStatus.INACTIVE },
        },
      );

      infoLog(
        `Cron deactivateInactiveUsers: Successfully deactivated ${updateResult} inactive users.`,
      );

      await this.cronjobLogRepository.create({
        type: ECronjobType.DEACTIVATE_INACTIVE_USERS,
        status: ECronjobStatus.SUCCESS,
        logs: `Deactivated ${updateResult} inactive users.`,
      });
    } catch (error) {
      errorLog(`Cron deactivateInactiveUserService:: Error:`, error);

      await this.cronjobLogRepository.create({
        type: ECronjobType.DEACTIVATE_INACTIVE_USERS,
        status: ECronjobStatus.FAILED,
        logs: error.toString(),
      });
    }
  }
}
