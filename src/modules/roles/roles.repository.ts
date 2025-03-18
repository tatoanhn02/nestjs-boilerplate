import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/shared/helpers/mongo.helper';

import { Role, RoleDocument } from './roles.schema';

@Injectable()
export class RoleRepository
  extends BaseRepository<RoleDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(Role.name) model: Model<RoleDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }
}
