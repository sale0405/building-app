import type { ModuleName } from '@building-app/shared';

export const enabledModules: ModuleName[] = [
  'auth',
  'users',
  'notifications',
  'chat',
  'smoke-break',
  'chores',
  'food-locker',
  'building-announcements',
  'admin',
];

export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
export const usesSameOriginApi = import.meta.env.PROD && !import.meta.env.VITE_API_URL;
export const isApiConfigured = Boolean(import.meta.env.VITE_API_URL) || usesSameOriginApi;
