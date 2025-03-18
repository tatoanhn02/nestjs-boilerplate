import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { BaseSchemaFactory } from 'src/shared/helpers/mongo.helper';

import { EAuthProviders } from '../auth/strategies/auth-providers.enum';
import { Role } from '../roles/roles.schema';
import { EUserStatus } from './users.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  password: string;

  @Prop({
    default: EAuthProviders.EMAIL,
    enum: EAuthProviders,
  })
  provider: string;

  @Prop({
    type: String,
    default: null,
  })
  socialId?: string | null;

  @Prop({
    enum: EUserStatus,
    default: EUserStatus.INACTIVE,
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  failedAttempts: number;

  @Prop({ type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ type: Date, default: null })
  lockUntil: Date | null;

  @Prop({
    ref: Role.name,
    type: SchemaTypes.Mixed,
  })
  role: Role;
}

export const UserSchema = BaseSchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;

UserSchema.index({ role: -1 });
