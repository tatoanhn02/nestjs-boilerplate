import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { BaseSchemaFactory } from '../../shared/helpers/mongo.helper';

@Schema({ timestamps: true })
export class Role {
  @Prop({ length: 50, type: String, unique: true })
  name: string;

  @Prop({
    type: String,
  })
  description?: string;
}

export const RoleSchema = BaseSchemaFactory.createForClass(Role);

export type RoleDocument = HydratedDocument<Role>;

RoleSchema.index({ name: -1 });
RoleSchema.index({ description: -1 });
