import prisma from '../../../core/database/prisma.js';
import { userInclude, toUserProfileDto } from '../../users/dto/user.dto.js';
import type { MessageDto, ConversationDto } from '@building-app/shared';
import { eventBus } from '../../../core/events/event-bus.js';

export class ChatRepository {
  createConversation(data: {
    type: 'DIRECT' | 'GROUP' | 'SYSTEM';
    participantIds: string[];
    title?: string;
    contextType?: string;
    contextId?: string;
  }) {
    return prisma.conversation.create({
      data: {
        type: data.type,
        title: data.title,
        contextType: data.contextType,
        contextId: data.contextId,
        participants: {
          create: data.participantIds.map((userId) => ({ userId })),
        },
      },
      include: conversationInclude,
    });
  }

  findDirectConversation(userId: string, otherUserId: string) {
    return prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
        participants: { every: { userId: { in: [userId, otherUserId] } } },
      },
      include: conversationInclude,
    });
  }

  listChatUsers(excludeUserId: string) {
    return prisma.user.findMany({
      where: { deletedAt: null, id: { not: excludeUserId } },
      include: userInclude,
      orderBy: { profile: { name: 'asc' } },
    });
  }

  findConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: conversationInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findConversation(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: { id, participants: { some: { userId } } },
      include: { participants: { include: { user: { include: userInclude } } } },
    });
  }

  getMessages(conversationId: string, page: number, pageSize: number) {
    return prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: {
        sender: { include: userInclude },
        attachments: true,
        readReceipts: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  createMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: 'TEXT' | 'SYSTEM' | 'FILE';
    attachments?: { storageKey: string; mimeType: string; fileName: string }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          type: data.type ?? 'TEXT',
          attachments: data.attachments
            ? { create: data.attachments }
            : undefined,
        },
        include: {
          sender: { include: userInclude },
          attachments: true,
          readReceipts: true,
        },
      });
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });
      return message;
    });
  }

  markRead(messageId: string, userId: string) {
    return prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: { readAt: new Date() },
    });
  }

  updateLastRead(conversationId: string, userId: string) {
    return prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  getParticipantIds(conversationId: string) {
    return prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
  }
}

const conversationInclude = {
  participants: { include: { user: { include: userInclude } } },
  messages: {
    take: 1,
    orderBy: { createdAt: 'desc' as const },
    include: { sender: { include: userInclude }, attachments: true, readReceipts: true },
  },
} as const;

function toMessageDto(
  m: Awaited<ReturnType<ChatRepository['createMessage']>>,
  storageUrl: (key: string) => string,
): MessageDto {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    type: m.type as MessageDto['type'],
    sender: m.sender ? toUserProfileDto(m.sender) : undefined,
    attachments: m.attachments?.map((a) => ({
      id: a.id,
      url: storageUrl(a.storageKey),
      fileName: a.fileName,
      mimeType: a.mimeType,
    })),
    readBy: m.readReceipts?.map((r) => r.userId),
    createdAt: m.createdAt.toISOString(),
  };
}

function toConversationDto(c: Awaited<ReturnType<ChatRepository['findConversations']>>[0], storageUrl: (key: string) => string): ConversationDto {
  const lastMsg = c.messages[0];
  return {
    id: c.id,
    type: c.type as ConversationDto['type'],
    title: c.title,
    contextType: c.contextType,
    contextId: c.contextId,
    participants: c.participants.map((p) => toUserProfileDto(p.user)),
    lastMessage: lastMsg ? toMessageDto(lastMsg as Parameters<typeof toMessageDto>[0], storageUrl) : undefined,
    createdAt: c.createdAt.toISOString(),
  };
}

export class ChatService {
  constructor(
    private repo: ChatRepository,
    private storageUrl: (key: string) => string,
  ) {}

  async listChatUsers(userId: string) {
    const users = await this.repo.listChatUsers(userId);
    return users.map((u) => toUserProfileDto(u));
  }

  async startDirectChat(userId: string, otherUserId: string) {
    if (userId === otherUserId) throw new Error('Cannot start a chat with yourself');

    const existing = await this.repo.findDirectConversation(userId, otherUserId);
    if (existing) return toConversationDto(existing, this.storageUrl);

    const conv = await this.repo.createConversation({
      type: 'DIRECT',
      participantIds: [userId, otherUserId],
    });
    return toConversationDto(conv, this.storageUrl);
  }

  async createConversation(userId: string, data: {
    type: 'DIRECT' | 'GROUP';
    participantIds: string[];
    title?: string;
    contextType?: string;
    contextId?: string;
  }) {
    if (data.type === 'DIRECT') {
      const otherUserId = data.participantIds[0];
      return this.startDirectChat(userId, otherUserId);
    }

    const allParticipants = [...new Set([userId, ...data.participantIds])];
    if (allParticipants.length < 3) {
      throw new Error('Group chats need at least three participants');
    }

    const conv = await this.repo.createConversation({
      ...data,
      participantIds: allParticipants,
      title: data.title ?? `Group (${allParticipants.length})`,
    });
    return toConversationDto(conv, this.storageUrl);
  }

  async listConversations(userId: string) {
    const convs = await this.repo.findConversations(userId);
    return convs.map((c) => toConversationDto(c, this.storageUrl));
  }

  async getMessages(conversationId: string, userId: string, page: number, pageSize: number) {
    const conv = await this.repo.findConversation(conversationId, userId);
    if (!conv) throw new Error('Conversation not found');
    const messages = await this.repo.getMessages(conversationId, page, pageSize);
    return messages.reverse().map((m) => toMessageDto(m as Parameters<typeof toMessageDto>[0], this.storageUrl));
  }

  async sendMessage(userId: string, conversationId: string, content: string, type: 'TEXT' | 'SYSTEM' | 'FILE' = 'TEXT', attachments?: { storageKey: string; mimeType: string; fileName: string }[]) {
    const conv = await this.repo.findConversation(conversationId, userId);
    if (!conv) throw new Error('Conversation not found');
    const message = await this.repo.createMessage({ conversationId, senderId: userId, content, type, attachments });
    const dto = toMessageDto(message, this.storageUrl);
    const participants = await this.repo.getParticipantIds(conversationId);
    const recipientIds = participants.map((p) => p.userId).filter((id) => id !== userId);
    eventBus.emit('chat.message.sent', { message: dto, recipientIds });
    return dto;
  }

  async markRead(conversationId: string, messageId: string, userId: string) {
    await this.repo.markRead(messageId, userId);
    await this.repo.updateLastRead(conversationId, userId);
  }

  async sendSystemMessage(conversationId: string, content: string) {
    const participants = await this.repo.getParticipantIds(conversationId);
    if (!participants.length) return;
    await this.sendMessage(participants[0].userId, conversationId, content, 'SYSTEM');
  }
}

export { toMessageDto, toConversationDto };
