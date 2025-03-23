import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { BaseSchemaFactory } from '../../../../shared/helpers/mongo.helper';
import { ECronjobStatus, ECronjobType } from './cronjob-logs.enum';

@Schema({ timestamps: true })
export class CronjobLog {
  @Prop({ type: String, enum: ECronjobType })
  type: string;

  @Prop({ type: String, enum: ECronjobStatus })
  status: string;

  @Prop({ type: String })
  logs: string;
}

export const CronjobLogSchema = BaseSchemaFactory.createForClass(CronjobLog);

export type CronjobLogDocument = HydratedDocument<CronjobLog>;
