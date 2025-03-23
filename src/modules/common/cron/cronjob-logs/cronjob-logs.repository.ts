import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../../../shared/helpers/mongo.helper';
import { CronjobLog, CronjobLogDocument } from './cronjob-logs.schema';

@Injectable()
export class CronjobLogRepository
  extends BaseRepository<CronjobLogDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(CronjobLog.name) model: Model<CronjobLogDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
