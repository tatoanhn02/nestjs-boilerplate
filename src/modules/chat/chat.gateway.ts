import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { JWT_SECRET } from '../../config/config.provider';
import { errorLog } from '../../shared/helpers/logger.helper';
import { SendMessageDto, WS_EVENTS } from './chat.dto';
import { ChatService } from './chat.service';

const onlineUsers = new Map<string, Set<string>>();

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUser(client: Socket): { userId: string } | null {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return null;
      const payload = this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });

      return { userId: payload.sub || payload.id || payload.userId };
    } catch (err) {
      errorLog('Error extracting user:', err);
      return null;
    }
  }

  async handleConnection(client: Socket) {
    const user = this.extractUser(client);

    if (!user) {
      client.disconnect();
      return;
    }

    const { userId } = user;
    client.data.userId = userId;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(client.id);

    client.join(`user:${userId}`);

    const conversations = await this.chatService.getConversations(userId);
    conversations.forEach((conv: any) => {
      client.join(`conv:${conv._id.toString()}`);
    });

    this.server.emit(WS_EVENTS.USER_ONLINE, { userId });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        this.server.emit(WS_EVENTS.USER_OFFLINE, { userId });
      }
    }
  }

  @SubscribeMessage(WS_EVENTS.JOIN_CONVERSATION)
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conv:${data.conversationId}`);
    return { status: 'joined' };
  }

  @SubscribeMessage(WS_EVENTS.LEAVE_CONVERSATION)
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conv:${data.conversationId}`);
    return { status: 'left' };
  }

  @SubscribeMessage(WS_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) throw new WsException('Unauthorized');

    try {
      const message = await this.chatService.sendMessage(userId, dto);

      this.server
        .to(`conv:${dto.conversationId}`)
        .emit(WS_EVENTS.NEW_MESSAGE, message);

      this.server
        .to(`conv:${dto.conversationId}`)
        .emit(WS_EVENTS.CONVERSATION_UPDATED, {
          conversationId: dto.conversationId,
        });

      return { status: 'ok', messageId: (message as any)._id };
    } catch (err: any) {
      throw new WsException(err.message || 'Failed to send message');
    }
  }

  @SubscribeMessage(WS_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    client.to(`conv:${data.conversationId}`).emit(WS_EVENTS.USER_TYPING, {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage(WS_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    client.to(`conv:${data.conversationId}`).emit(WS_EVENTS.USER_STOP_TYPING, {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage(WS_EVENTS.MARK_SEEN)
  async handleMarkSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    await this.chatService.markSeen(data.conversationId, userId);

    client.to(`conv:${data.conversationId}`).emit(WS_EVENTS.MESSAGE_SEEN, {
      conversationId: data.conversationId,
      userId,
    });
  }

  isOnline(userId: string): boolean {
    return onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(onlineUsers.keys());
  }
}
