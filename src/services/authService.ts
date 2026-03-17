import { api, setToken, removeToken } from './api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await api.post<AuthResponse>('/auth/login', { email, password });
    if (error) throw new Error(error);
    await setToken(data!.token);
    return data!;
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await api.post<AuthResponse>('/auth/register', { email, password });
    if (error) throw new Error(error);
    await setToken(data!.token);
    return data!;
  },

  async signOut(): Promise<void> {
    await removeToken();
  },

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await api.put('/auth/password', { password: newPassword });
    if (error) throw new Error(error);
  },

  async getMe(): Promise<AuthResponse['user'] | null> {
    const { data, error } = await api.get<AuthResponse['user']>('/auth/me');
    if (error) return null;
    return data!;
  },
};
