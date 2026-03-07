import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MessageType } from './message.schema';

export class CreateDirectConversationDto {
  @ApiPropertyOptional()
  @IsOptional()
  targetUserId?: string;
}

export class CreateGroupConversationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  participantIds: string[];
}

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}

export class GetMessagesDto {
  @IsMongoId()
  conversationId: string;

  @IsOptional()
  @IsMongoId()
  before?: string;

  @IsOptional()
  limit?: number;
}

export const WS_EVENTS = {
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE: 'send_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MARK_SEEN: 'mark_seen',

  NEW_MESSAGE: 'new_message',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  MESSAGE_SEEN: 'message_seen',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  CONVERSATION_UPDATED: 'conversation_updated',
  ERROR: 'error',
} as const;
