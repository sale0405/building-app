import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@building-app/shared';
import { config } from '../../config/modules.js';
import prisma from '../database/prisma.js';
import { eventBus } from '../events/event-bus.js';

let io: Server | null = null;

export function initSocketGateway(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: config.corsOrigin, credentials: true },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
      const user = await prisma.user.findFirst({
        where: { id: payload.id, deletedAt: null },
      });
      if (!user) {
        next(new Error('User not found'));
        return;
      }
      socket.data.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        floorId: user.floorId,
      } as AuthUser;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthUser;
    socket.join(`user:${user.id}`);
    socket.join(`floor:${user.floorId}`);

    socket.on('chat:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('chat:typing', {
        conversationId: data.conversationId,
        userId: user.id,
        isTyping: data.isTyping,
      });
    });
  });

  eventBus.on('notification.created', ({ notification }) => {
    io?.to(`user:${notification.userId}`).emit('notification:new', notification);
  });

  eventBus.on('smoke-break.invitation.created', ({ invitation, floorId }) => {
    io?.to(`floor:${floorId}`).emit('smoke-break:invitation', invitation);
  });

  eventBus.on('smoke-break.participant.joined', ({ invitationId, userId, creatorId }) => {
    io?.to(`user:${creatorId}`).emit('smoke-break:joined', { invitationId, userId });
  });

  eventBus.on('chat.message.sent', ({ message, recipientIds }) => {
    io?.to(`conversation:${message.conversationId}`).emit('chat:message', message);
    recipientIds.forEach((id) => {
      io?.to(`user:${id}`).emit('chat:message', message);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
