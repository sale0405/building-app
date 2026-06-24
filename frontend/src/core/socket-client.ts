import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/modules.js';
import { apiClient } from './api-client.js';

let socket: Socket | null = null;

function resolveSocketUrl(): string | null {
  if (SOCKET_URL) return SOCKET_URL;
  if (import.meta.env.DEV) return 'http://localhost:3001';
  return null;
}

export function connectSocket(): Socket | null {
  const url = resolveSocketUrl();
  if (!url) return null;

  if (socket?.connected) return socket;

  const token = apiClient.getAccessToken();
  socket = io(url, {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinConversation(conversationId: string) {
  socket?.emit('chat:join', conversationId);
}

export function leaveConversation(conversationId: string) {
  socket?.emit('chat:leave', conversationId);
}

export function sendTyping(conversationId: string, isTyping: boolean) {
  socket?.emit('chat:typing', { conversationId, isTyping });
}
