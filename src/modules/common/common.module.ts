import { Global, Module } from '@nestjs/common';

import { CronModule } from './cron/cron.module';

@Global()
@Module({
  imports: [CronModule],
})
export class CommonModule {}
