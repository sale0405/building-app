import { io, Socket } from 'socket.io-client';
import { apiClient } from './api-client.js';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = apiClient.getAccessToken();
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
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
