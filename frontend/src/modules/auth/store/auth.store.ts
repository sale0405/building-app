import { create } from 'zustand';
import type { UserProfileDto, TokenPair } from '@building-app/shared';
import { isApiConfigured } from '../../../config/modules.js';
import { apiClient } from '../../../core/api-client.js';
import { connectSocket, disconnectSocket } from '../../../core/socket-client.js';
import { t } from '../../../core/i18n/index.js';

function mapAuthError(error: string | undefined, fallback: string): string {
  if (!error) return fallback;
  if (error === 'Network error') return t('auth.networkError');
  if (
    error === 'Server unavailable' ||
    error === 'Invalid server response' ||
    error === 'Unexpected server response'
  ) {
    return t('auth.serverUnavailable');
  }
  return error;
}

interface AuthState {
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Record<string, unknown>) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  init: async () => {
    apiClient.loadTokens();
    const hasSession =
      Boolean(apiClient.getAccessToken()) || Boolean(localStorage.getItem('refreshToken'));

    if (hasSession) {
      if (!apiClient.getAccessToken()) {
        await apiClient.refreshAccessToken();
      }
      await get().loadUser();
      if (get().isAuthenticated && isApiConfigured) {
        connectSocket();
      }
    }

    set({ isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ user: UserProfileDto; tokens: TokenPair }>(
        '/auth/login',
        { email, password },
        { skipAuth: true },
      );
      if (!res.success || !res.data) {
        set({ error: mapAuthError(res.error, t('auth.loginFailed')) });
        return false;
      }
      apiClient.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      set({ user: res.data.user, isAuthenticated: true });
      if (isApiConfigured) connectSocket();
      return true;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<{ user: UserProfileDto; tokens: TokenPair }>(
        '/auth/register',
        data,
        { skipAuth: true },
      );
      if (!res.success || !res.data) {
        set({ error: mapAuthError(res.error, t('auth.registerFailed')) });
        return false;
      }
      apiClient.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      set({ user: res.data.user, isAuthenticated: true });
      if (isApiConfigured) connectSocket();
      return true;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
    apiClient.clearTokens();
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const res = await apiClient.get<UserProfileDto>('/users/me');
    if (res.success && res.data) {
      set({ user: res.data, isAuthenticated: true });
      return;
    }

    if (localStorage.getItem('refreshToken')) {
      const refreshed = await apiClient.refreshAccessToken();
      if (refreshed) {
        const retry = await apiClient.get<UserProfileDto>('/users/me');
        if (retry.success && retry.data) {
          set({ user: retry.data, isAuthenticated: true });
          return;
        }
      }
    }

    apiClient.clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
