import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
} from './chat.dto';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JWTAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.id);
  }

  @Post('conversations/direct')
  createDirect(@Request() req: any, @Body() dto: CreateDirectConversationDto) {
    return this.chatService.createDirectConversation(req.user.id, dto);
  }

  @Post('conversations/group')
  createGroup(@Request() req: any, @Body() dto: CreateGroupConversationDto) {
    return this.chatService.createGroupConversation(req.user.id, dto);
  }

  @Get('conversations/:id')
  getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(id, req.user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Query('before') before?: string,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit?: number,
  ) {
    return this.chatService.getMessages(
      conversationId,
      req.user.id,
      before,
      limit,
    );
  }

  @Post('conversations/:id/seen')
  markSeen(@Request() req: any, @Param('id') conversationId: string) {
    return this.chatService.markSeen(conversationId, req.user.id);
  }

  @Get('online')
  getOnlineUsers() {
    return { onlineUsers: this.chatGateway.getOnlineUsers() };
  }

  @Get('online/:userId')
  isUserOnline(@Param('userId') userId: string) {
    return { userId, online: this.chatGateway.isOnline(userId) };
  }
}
