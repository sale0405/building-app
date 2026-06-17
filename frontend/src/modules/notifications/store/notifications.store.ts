import { create } from 'zustand';
import type { NotificationDto } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { getSocket } from '../../../core/socket-client.js';

interface NotificationsListResponse {
  items: NotificationDto[];
  unread: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface NotificationsState {
  items: NotificationDto[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  fetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  respond: (id: string, action: string) => Promise<void>;
  resolve: (id: string) => Promise<void>;
  createAnnouncement: (data: {
    title: string;
    body: string;
    validityMode: 'TIMED' | 'UNTIL_RESOLVED';
    expiresAt?: string;
  }) => Promise<boolean>;
  subscribeRealtime: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    const res = await apiClient.get<NotificationsListResponse>('/notifications?page=1&pageSize=100');
    if (res.success && res.data) {
      set({
        items: res.data.items,
        unreadCount: res.data.unread,
        total: res.data.total,
        page: res.data.page,
        totalPages: res.data.totalPages,
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { page, totalPages, items } = get();
    if (page >= totalPages) return;

    const nextPage = page + 1;
    const res = await apiClient.get<NotificationsListResponse>(
      `/notifications?page=${nextPage}&pageSize=100`,
    );
    if (res.success && res.data) {
      set({
        items: [...items, ...res.data.items],
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
        unreadCount: res.data.unread,
      });
    }
  },

  markRead: async (id) => {
    await apiClient.patch(`/notifications/${id}/read`);
    await get().fetch();
  },

  markAllRead: async () => {
    await apiClient.patch('/notifications/read-all');
    await get().fetch();
  },

  deleteNotification: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
    await get().fetch();
  },

  respond: async (id, action) => {
    await apiClient.post(`/notifications/${id}/respond`, { action });
    await get().fetch();
  },

  resolve: async (id) => {
    await apiClient.post(`/notifications/${id}/resolve`);
    await get().fetch();
  },

  createAnnouncement: async (data) => {
    const res = await apiClient.post('/notifications', data);
    if (res.success) {
      await get().fetch();
      return true;
    }
    return false;
  },

  subscribeRealtime: () => {
    const socket = getSocket();
    socket?.on('notification:new', () => {
      get().fetch();
    });
  },
}));
