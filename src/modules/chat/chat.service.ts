import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  SendMessageDto,
} from './chat.dto';
import {
  Conversation,
  ConversationDocument,
  ConversationType,
} from './conversation.schema';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async getConversations(userId: string) {
    const uid = new Types.ObjectId(userId);
    return this.conversationModel
      .find({ participants: uid })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'firstName lastName email avatar')
      .populate('lastMessage')
      .lean();
  }

  async createDirectConversation(
    userId: string,
    dto: CreateDirectConversationDto,
  ) {
    const uid = new Types.ObjectId(userId);
    const targetId = new Types.ObjectId(dto.targetUserId);

    if (uid.equals(targetId)) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    const existing = await this.conversationModel.findOne({
      type: ConversationType.DIRECT,
      participants: { $all: [uid, targetId], $size: 2 },
    });

    if (existing) {
      return existing.populate(
        'participants',
        'firstName lastName email avatar',
      );
    }

    const conversation = await this.conversationModel.create({
      type: ConversationType.DIRECT,
      participants: [uid, targetId],
      unreadCounts: {},
    });

    return conversation.populate(
      'participants',
      'firstName lastName email avatar',
    );
  }

  async createGroupConversation(
    userId: string,
    dto: CreateGroupConversationDto,
  ) {
    const uid = new Types.ObjectId(userId);
    const participantIds = [
      uid,
      ...dto.participantIds
        .filter((id) => id !== userId)
        .map((id) => new Types.ObjectId(id)),
    ];

    const conversation = await this.conversationModel.create({
      type: ConversationType.GROUP,
      name: dto.name,
      admin: uid,
      participants: participantIds,
      unreadCounts: {},
    });

    return conversation.populate(
      'participants',
      'firstName lastName email avatar',
    );
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .populate('participants', 'firstName lastName email avatar')
      .populate('lastMessage')
      .lean();

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isMember = conversation.participants.some(
      (p: any) => p._id.toString() === userId,
    );
    if (!isMember) throw new ForbiddenException('Not a member');

    return conversation;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    before?: string,
    limit = 30,
  ) {
    await this.getConversation(conversationId, userId);

    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
      isDeleted: false,
    };
    if (before) {
      const cursorMsg = await this.messageModel.findById(before);
      if (cursorMsg) query.createdAt = { $lt: (cursorMsg as any).createdAt };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .populate('sender', 'firstName lastName avatar')
      .lean();

    return messages.reverse();
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const uid = new Types.ObjectId(userId);
    const convId = new Types.ObjectId(dto.conversationId);

    const conversation = await this.conversationModel.findById(convId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isMember = conversation.participants.some((p) => p.equals(uid));
    if (!isMember) throw new ForbiddenException('Not a member');

    const message = await this.messageModel.create({
      conversationId: convId,
      sender: uid,
      content: dto.content,
      type: dto.type || 'text',
      fileUrl: dto.fileUrl || null,
      fileName: dto.fileName || null,
      seenBy: [uid],
    });

    const unreadUpdate: Record<string, number> = {};
    conversation.participants.forEach((participantId) => {
      if (!participantId.equals(uid)) {
        const key = participantId.toString();
        const current = conversation.unreadCounts.get(key) || 0;
        unreadUpdate[`unreadCounts.${key}`] = current + 1;
      }
    });

    await this.conversationModel.findByIdAndUpdate(convId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      ...unreadUpdate,
    });

    return message.populate('sender', 'firstName lastName avatar');
  }

  async markSeen(conversationId: string, userId: string) {
    const uid = new Types.ObjectId(userId);
    const convId = new Types.ObjectId(conversationId);

    await this.messageModel.updateMany(
      {
        conversationId: convId,
        sender: { $ne: uid },
        seenBy: { $ne: uid },
      },
      { $addToSet: { seenBy: uid } },
    );

    await this.conversationModel.findByIdAndUpdate(convId, {
      [`unreadCounts.${userId}`]: 0,
    });
  }

  async getOrCreateConversation(userId: string, targetUserId: string) {
    return this.createDirectConversation(userId, { targetUserId });
  }
}
