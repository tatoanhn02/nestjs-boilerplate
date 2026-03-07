import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ enum: ConversationType, required: true })
  type: ConversationType;

  @Prop({ default: null })
  name: string | null;

  @Prop({ default: null })
  avatar: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  admin: Types.ObjectId | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage: Types.ObjectId | null;

  @Prop({ default: null })
  lastMessageAt: Date | null;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCounts: Map<string, number>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1, lastMessageAt: -1 });
ConversationSchema.index({ type: 1, participants: 1 }, { unique: false });
