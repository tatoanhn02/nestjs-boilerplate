import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';

import { errorLog, infoLog } from './logger.helper';

export class BaseQueue {
  @OnQueueActive()
  onActive(job: Job) {
    infoLog(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    infoLog(
      `Completed job ${job.id} of type ${job.name} with result ${JSON.stringify(
        job.returnvalue,
      )}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    job.remove();
    errorLog(
      `Failed job ${job.id} of type ${job.name} with failed reason: ${job.failedReason}`,
    );
  }
}
