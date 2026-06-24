import type { ApiResponse } from '@building-app/shared';
import { API_BASE } from '../config/modules.js';

type RequestOptions = RequestInit & { skipAuth?: boolean };

const REQUEST_TIMEOUT_MS = 15000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken() {
    return this.accessToken;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
        if (!res.ok) return false;
        const json = (await res.json()) as ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>;
        if (json.data?.tokens) {
          this.setTokens(json.data.tokens.accessToken, json.data.tokens.refreshToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        error: res.ok ? 'Unexpected server response' : 'Server unavailable',
      };
    }

    try {
      return (await res.json()) as ApiResponse<T>;
    } catch {
      return { success: false, error: 'Invalid server response' };
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (!options.skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers });

      if (res.status === 401 && !options.skipAuth && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed && this.accessToken) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers });
        }
      }

      return this.parseResponse<T>(res);
    } catch {
      return { success: false, error: 'Network error' };
    }
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
